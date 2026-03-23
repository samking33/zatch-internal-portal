import {
  AuditAction,
  SellerStatus,
  type IManagedSellerDetail,
  type ISeller,
  type ISellerCityStats,
  type ISellerPincodeStats,
  type ISellerStateStats,
  type SellerListStatus,
} from '@zatch/shared';

import { AppError } from '../../lib/app-error';
import { logger } from '../../middleware/logger.middleware';
import { auditService } from '../audit/audit.service';
import { UpstreamSellerClient } from './upstream-seller.client';

type UpdateSellerStatusInput = {
  sellerId: string;
  action: 'approve' | 'reject';
  note?: string;
  adminUserId: string;
  adminUserEmail: string;
  ipAddress?: string;
};

type SellerListFilters = {
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

export class SellerService {
  public constructor(private readonly upstreamSellerClient: UpstreamSellerClient) {}

  public async getSellers(query: SellerListFilters): Promise<{
    items: ISeller[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.upstreamSellerClient.listSellers({
      page: query.page,
      limit: query.limit,
      ...(query.states ? { states: query.states } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.pincode ? { pincode: query.pincode } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from ? { from: query.from } : {}),
      ...(query.to ? { to: query.to } : {}),
    });
  }

  public async getSellerDetailById(sellerId: string): Promise<IManagedSellerDetail> {
    return this.upstreamSellerClient.getSellerDetailById(sellerId);
  }

  public async getCountByState(): Promise<ISellerStateStats[]> {
    const sellers = await this.upstreamSellerClient.listAllSellers();
    const counts = new Map<string, ISellerStateStats>();

    sellers.forEach((seller) => {
      const state = seller.location.state.trim();
      if (!state) {
        return;
      }

      const current = counts.get(state) ?? {
        state,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      current.total += 1;
      if (seller.status === SellerStatus.PENDING) current.pending += 1;
      if (seller.status === SellerStatus.APPROVED) current.approved += 1;
      if (seller.status === SellerStatus.REJECTED) current.rejected += 1;
      counts.set(state, current);
    });

    return Array.from(counts.values()).sort((left, right) => right.total - left.total || left.state.localeCompare(right.state));
  }

  public async getCountByCity(states?: string[]): Promise<ISellerCityStats[]> {
    const sellers = await this.upstreamSellerClient.listAllSellers();
    const counts = new Map<string, ISellerCityStats>();

    sellers.forEach((seller) => {
      const state = seller.location.state.trim();
      const city = seller.location.city.trim();

      if (!state || !city) {
        return;
      }

      if (states && states.length > 0 && !states.includes(state)) {
        return;
      }

      const key = `${state}::${city}`;
      const current = counts.get(key) ?? {
        city,
        state,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      current.total += 1;
      if (seller.status === SellerStatus.PENDING) current.pending += 1;
      if (seller.status === SellerStatus.APPROVED) current.approved += 1;
      if (seller.status === SellerStatus.REJECTED) current.rejected += 1;
      counts.set(key, current);
    });

    return Array.from(counts.values()).sort((left, right) => right.total - left.total || left.city.localeCompare(right.city));
  }

  public async getCountByPincode(params: {
    city?: string;
    states?: string[];
  }): Promise<ISellerPincodeStats[]> {
    const sellers = await this.upstreamSellerClient.listAllSellers();
    const counts = new Map<string, ISellerPincodeStats>();

    sellers.forEach((seller) => {
      const state = seller.location.state.trim();
      const city = seller.location.city.trim();
      const pincode = seller.location.pincode.trim();

      if (!state || !city || !pincode) {
        return;
      }

      if (params.city && city.toLowerCase() !== params.city.toLowerCase()) {
        return;
      }

      if (params.states && params.states.length > 0 && !params.states.includes(state)) {
        return;
      }

      const key = `${state}::${city}::${pincode}`;
      const current = counts.get(key) ?? {
        pincode,
        city,
        state,
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0,
      };

      current.total += 1;
      if (seller.status === SellerStatus.PENDING) current.pending += 1;
      if (seller.status === SellerStatus.APPROVED) current.approved += 1;
      if (seller.status === SellerStatus.REJECTED) current.rejected += 1;
      counts.set(key, current);
    });

    return Array.from(counts.values()).sort((left, right) => right.total - left.total || left.pincode.localeCompare(right.pincode));
  }

  public async updateStatus(input: UpdateSellerStatusInput): Promise<ISeller> {
    const seller = await this.upstreamSellerClient.getSellerById(input.sellerId);

    if (seller.status !== SellerStatus.PENDING) {
      throw new AppError(409, 'Seller has already been actioned');
    }

    const updatedSeller = await this.upstreamSellerClient.updateStatus({
      sellerId: input.sellerId,
      action: input.action,
      ...(input.note ? { note: input.note } : {}),
    });

    const auditAction =
      input.action === 'approve' ? AuditAction.SELLER_APPROVED : AuditAction.SELLER_REJECTED;

    try {
      await auditService.log({
        action: auditAction,
        adminUserId: input.adminUserId,
        adminUserEmail: input.adminUserEmail,
        targetId: updatedSeller._id,
        targetCollection: 'sellers',
        ...(input.note ? { note: input.note } : {}),
        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
        metadata: {
          source: 'upstream',
          previousStatus: seller.status,
          nextStatus: updatedSeller.status,
        },
      });
    } catch (error) {
      logger.error('Failed to write local audit log after upstream seller action', {
        sellerId: input.sellerId,
        action: input.action,
        error: error instanceof Error ? error.message : 'Unknown audit failure',
      });
    }

    return updatedSeller;
  }
}

export const sellerService = new SellerService(new UpstreamSellerClient());
