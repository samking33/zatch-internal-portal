import { Types, type ClientSession, type FilterQuery } from 'mongoose';

import {
  SellerStatus,
  type ISeller,
  type ISellerCityStats,
  type ISellerPincodeStats,
  type ISellerStateStats,
  type SellerIntakeInput,
  type SellerListStatus,
} from '@zatch/shared';

import { Seller, serializeSeller, type SellerModelAttributes } from './seller.model';

type SellerListQuery = {
  states?: string[];
  city?: string;
  pincode?: string;
  status?: SellerListStatus;
  from?: Date;
  to?: Date;
  page: number;
  limit: number;
  sortBy?: 'receivedAt';
};

type UpdateStatusInput = {
  sellerId: string;
  nextStatus: SellerStatus.APPROVED | SellerStatus.REJECTED;
  changedBy: string;
  note?: string;
  session: ClientSession;
};

type SellerWithObjectId = SellerModelAttributes & { _id: Types.ObjectId };

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class SellerRepository {
  public async existsByEmail(email: string): Promise<boolean> {
    const existingSeller = await Seller.exists({ email });
    return existingSeller !== null;
  }

  public async existsByGstOrEnrollmentId(gstOrEnrollmentId: string): Promise<boolean> {
    const existingSeller = await Seller.exists({ gstOrEnrollmentId });
    return existingSeller !== null;
  }

  private buildFilter(query: Omit<SellerListQuery, 'page' | 'limit' | 'sortBy'>): FilterQuery<SellerModelAttributes> {
    const filter: FilterQuery<SellerModelAttributes> = {};

    if (query.states && query.states.length > 0) {
      filter['location.state'] = { $in: query.states };
    }

    if (query.city) {
      filter['location.city'] = { $regex: escapeRegExp(query.city), $options: 'i' };
    }

    if (query.pincode) {
      filter['location.pincode'] = query.pincode;
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    } else if (!query.status) {
      filter.status = SellerStatus.PENDING;
    }

    if (query.from || query.to) {
      filter.receivedAt = {};

      if (query.from) {
        filter.receivedAt.$gte = query.from;
      }

      if (query.to) {
        filter.receivedAt.$lte = query.to;
      }
    }

    return filter;
  }

  public async findWithFilters(query: SellerListQuery): Promise<{
    items: ISeller[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter = this.buildFilter(query);
    const sortField = query.sortBy ?? 'receivedAt';
    const skip = (query.page - 1) * query.limit;

    const [rawItems, total] = await Promise.all([
      Seller.find(filter)
        .sort({ [sortField]: -1 })
        .skip(skip)
        .limit(query.limit)
        .lean()
        .exec(),
      Seller.countDocuments(filter).exec(),
    ]);
    const items = rawItems as SellerWithObjectId[];

    return {
      items: items.map((item) => serializeSeller(item)),
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  public async findById(sellerId: string): Promise<ISeller | null> {
    const rawSeller = await Seller.findById(sellerId).lean().exec();
    const seller = rawSeller as SellerWithObjectId | null;
    return seller ? serializeSeller(seller) : null;
  }

  public async findByIdForUpdate(
    sellerId: string,
    session: ClientSession,
  ): Promise<ISeller | null> {
    const rawSeller = await Seller.findById(sellerId).session(session).lean().exec();
    const seller = rawSeller as SellerWithObjectId | null;
    return seller ? serializeSeller(seller) : null;
  }

  public async updateStatus(input: UpdateStatusInput): Promise<ISeller | null> {
    const seller = await Seller.findOneAndUpdate(
      {
        _id: input.sellerId,
        status: SellerStatus.PENDING,
      },
      {
        $set: {
          status: input.nextStatus,
        },
        $push: {
          statusHistory: {
            status: input.nextStatus,
            changedBy: input.changedBy,
            changedAt: new Date(),
            ...(input.note ? { note: input.note } : {}),
          },
        },
      },
      {
        new: true,
        session: input.session,
      },
    ).exec();

    return seller ? serializeSeller(seller) : null;
  }

  public async createFromIntake(input: SellerIntakeInput): Promise<ISeller> {
    const seller = await Seller.create({
      sellerName: input.sellerName,
      businessName: input.businessName,
      email: input.email,
      phone: input.phone,
      gstOrEnrollmentId: input.gstOrEnrollmentId,
      location: {
        street: input.location.street,
        city: input.location.city,
        state: input.location.state,
        pincode: input.location.pincode,
        lat: null,
        lng: null,
      },
      documents: input.documents,
      status: SellerStatus.PENDING,
      source: 'mobile_app',
      receivedAt: new Date(),
      statusHistory: [
        {
          status: SellerStatus.PENDING,
          changedBy: null,
          changedAt: new Date(),
        },
      ],
      ...(input.metadata ? { metadata: input.metadata } : {}),
    });

    return serializeSeller(seller);
  }

  public async setCoordinates(
    sellerId: string,
    coordinates: { lat: number; lng: number },
  ): Promise<void> {
    await Seller.updateOne(
      { _id: sellerId },
      {
        $set: {
          'location.lat': coordinates.lat,
          'location.lng': coordinates.lng,
        },
      },
    ).exec();
  }

  public async getCountByState(): Promise<ISellerStateStats[]> {
    const rows = await Seller.aggregate<{
      _id: string;
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>([
      {
        $match: {
          'location.state': { $exists: true, $ne: '' },
        },
      },
      {
        $group: {
          _id: '$location.state',
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1, _id: 1 } },
    ]).exec();

    return rows.map((row) => ({
      state: row._id,
      total: row.total,
      pending: row.pending,
      approved: row.approved,
      rejected: row.rejected,
    }));
  }

  public async getCountByCity(states?: string[]): Promise<ISellerCityStats[]> {
    const match: FilterQuery<SellerModelAttributes> = {
      'location.city': { $exists: true, $ne: '' },
      'location.state': { $exists: true, $ne: '' },
    };

    if (states && states.length > 0) {
      match['location.state'] = { $in: states };
    }

    const rows = await Seller.aggregate<{
      _id: string;
      state: string;
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: '$location.city',
          state: { $first: '$location.state' },
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1, _id: 1 } },
    ]).exec();

    return rows.map((row) => ({
      city: row._id,
      state: row.state,
      total: row.total,
      pending: row.pending,
      approved: row.approved,
      rejected: row.rejected,
    }));
  }

  public async getCountByPincode(params: {
    city?: string;
    states?: string[];
  }): Promise<ISellerPincodeStats[]> {
    const match: FilterQuery<SellerModelAttributes> = {
      'location.pincode': { $exists: true, $ne: '' },
      'location.city': { $exists: true, $ne: '' },
      'location.state': { $exists: true, $ne: '' },
    };

    if (params.city) {
      match['location.city'] = { $regex: escapeRegExp(params.city), $options: 'i' };
    }

    if (params.states && params.states.length > 0) {
      match['location.state'] = { $in: params.states };
    }

    const rows = await Seller.aggregate<{
      _id: string;
      city: string;
      state: string;
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: '$location.pincode',
          city: { $first: '$location.city' },
          state: { $first: '$location.state' },
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
        },
      },
      { $sort: { total: -1, _id: 1 } },
    ]).exec();

    return rows.map((row) => ({
      pincode: row._id,
      city: row.city,
      state: row.state,
      total: row.total,
      pending: row.pending,
      approved: row.approved,
      rejected: row.rejected,
    }));
  }
}
