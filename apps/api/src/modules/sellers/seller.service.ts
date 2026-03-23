import mongoose from 'mongoose';
import { MongoServerError } from 'mongodb';

import {
  AuditAction,
  SellerStatus,
  type ISeller,
  type ISellerCityStats,
  type ISellerLocation,
  type ISellerPincodeStats,
  type ISellerStateStats,
  type SellerIntakeInput,
  type SellerListStatus,
} from '@zatch/shared';

import { AppError } from '../../lib/app-error';
import { logger } from '../../middleware/logger.middleware';
import { auditService } from '../audit/audit.service';
import { SellerRepository } from './seller.repository';

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
  public constructor(private readonly sellerRepository: SellerRepository) {}

  public async getSellers(query: SellerListFilters): Promise<{
    items: ISeller[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.sellerRepository.findWithFilters(query);
  }

  public async getSellerById(sellerId: string): Promise<ISeller> {
    const seller = await this.sellerRepository.findById(sellerId);

    if (!seller) {
      throw new AppError(404, 'Seller not found');
    }

    return seller;
  }

  public async createFromIntake(input: SellerIntakeInput, ipAddress?: string): Promise<{
    sellerId: string;
    status: SellerStatus.PENDING;
    receivedAt: Date;
  }> {
    const emailExists = await this.sellerRepository.existsByEmail(input.email);

    if (emailExists) {
      throw new AppError(409, 'Email already registered');
    }

    const gstExists = await this.sellerRepository.existsByGstOrEnrollmentId(input.gstOrEnrollmentId);

    if (gstExists) {
      throw new AppError(409, 'GST/Enrollment ID already registered');
    }

    try {
      const seller = await this.sellerRepository.createFromIntake(input);

      await auditService.log({
        action: AuditAction.SELLER_SUBMITTED,
        adminUserId: null,
        adminUserEmail: 'system',
        targetId: seller._id,
        targetCollection: 'sellers',
        ...(ipAddress ? { ipAddress } : {}),
        metadata: {
          source: 'mobile_app',
          ...(ipAddress ? { ip: ipAddress } : {}),
        },
      });

      void this.geocodeAndSave(seller._id, seller.location);

      return {
        sellerId: seller._id,
        status: SellerStatus.PENDING,
        receivedAt: seller.receivedAt,
      };
    } catch (error) {
      if (
        error instanceof MongoServerError &&
        error.code === 11000 &&
        typeof error.keyPattern === 'object' &&
        error.keyPattern !== null
      ) {
        if ('email' in error.keyPattern) {
          throw new AppError(409, 'Email already registered');
        }

        if ('gstOrEnrollmentId' in error.keyPattern) {
          throw new AppError(409, 'GST/Enrollment ID already registered');
        }
      }

      throw error;
    }
  }

  public async getCountByState(): Promise<ISellerStateStats[]> {
    return this.sellerRepository.getCountByState();
  }

  public async getCountByCity(states?: string[]): Promise<ISellerCityStats[]> {
    return this.sellerRepository.getCountByCity(states);
  }

  public async getCountByPincode(params: {
    city?: string;
    states?: string[];
  }): Promise<ISellerPincodeStats[]> {
    return this.sellerRepository.getCountByPincode(params);
  }

  public async updateStatus(input: UpdateSellerStatusInput): Promise<ISeller> {
    const seller = await this.sellerRepository.findById(input.sellerId);

    if (!seller) {
      throw new AppError(404, 'Seller not found');
    }

    if (seller.status !== SellerStatus.PENDING) {
      throw new AppError(409, 'Seller has already been actioned');
    }

    const nextStatus =
      input.action === 'approve' ? SellerStatus.APPROVED : SellerStatus.REJECTED;
    const auditAction =
      input.action === 'approve' ? AuditAction.SELLER_APPROVED : AuditAction.SELLER_REJECTED;

    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const updatedSeller = await this.sellerRepository.updateStatus({
        sellerId: input.sellerId,
        nextStatus,
        changedBy: input.adminUserId,
        ...(input.note ? { note: input.note } : {}),
        session,
      });

      if (!updatedSeller) {
        throw new AppError(409, 'Seller has already been actioned');
      }

      await auditService.log({
        action: auditAction,
        adminUserId: input.adminUserId,
        adminUserEmail: input.adminUserEmail,
        targetId: updatedSeller._id,
        targetCollection: 'sellers',
        ...(input.note ? { note: input.note } : {}),
        ...(input.ipAddress ? { ipAddress: input.ipAddress } : {}),
        metadata: {
          previousStatus: seller.status,
          nextStatus: updatedSeller.status,
        },
        session,
      });

      await session.commitTransaction();
      return updatedSeller;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  private async geocodeAndSave(sellerId: string, location: ISellerLocation): Promise<void> {
    try {
      const queries = [
        `${location.street}, ${location.city}, ${location.state}, ${location.pincode}, India`,
        `${location.city}, ${location.state}, ${location.pincode}, India`,
        `${location.pincode}, ${location.city}, ${location.state}, India`,
        `${location.city}, ${location.state}, India`,
      ];

      let firstResult: { lat?: string; lon?: string } | undefined;

      for (const value of queries) {
        const query = encodeURIComponent(value);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
          {
            signal: AbortSignal.timeout(5_000),
            headers: {
              'User-Agent': 'ZatchAdminPortal/1.0',
            },
          },
        );

        if (!response.ok) {
          throw new Error(`Geocoding failed with status ${response.status}`);
        }

        const payload = (await response.json()) as Array<{ lat?: string; lon?: string }>;
        firstResult = payload[0];

        if (firstResult?.lat && firstResult?.lon) {
          break;
        }
      }

      if (!firstResult?.lat || !firstResult?.lon) {
        return;
      }

      const lat = Number.parseFloat(firstResult.lat);
      const lng = Number.parseFloat(firstResult.lon);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      await this.sellerRepository.setCoordinates(sellerId, { lat, lng });
    } catch (error) {
      logger.warn('Geocoding failed', {
        sellerId,
        error: error instanceof Error ? error.message : 'Unknown geocoding failure',
      });
    }
  }
}

export const sellerService = new SellerService(new SellerRepository());
