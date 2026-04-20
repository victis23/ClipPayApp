import {
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
} from 'firebase/firestore'
import {
  UserDoc,
  CampaignDoc,
  ClipDoc,
  ApplicationDoc,
  PayoutDoc,
  SocialAccountDoc,
} from '../types'

function makeConverter<T extends DocumentData>(): FirestoreDataConverter<T> {
  return {
    toFirestore(data: T): DocumentData {
      return { ...data }
    },
    fromFirestore(snapshot: QueryDocumentSnapshot): T {
      const data = snapshot.data()
      return { ...data, id: snapshot.id } as unknown as T
    },
  }
}

export const userConverter: FirestoreDataConverter<UserDoc> = {
  toFirestore(user: UserDoc): DocumentData {
    return { ...user }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): UserDoc {
    const data = snapshot.data()
    return {
      ...data,
      uid: snapshot.id,
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    } as UserDoc
  },
}

export const campaignConverter: FirestoreDataConverter<CampaignDoc> = {
  toFirestore(campaign: CampaignDoc): DocumentData {
    return { ...campaign }
  },
  fromFirestore(snapshot: QueryDocumentSnapshot): CampaignDoc {
    const data = snapshot.data()
    return {
      ...data,
      id: snapshot.id,
      createdAt: data['createdAt'],
      updatedAt: data['updatedAt'],
    } as CampaignDoc
  },
}

export const clipConverter:        FirestoreDataConverter<ClipDoc>         = makeConverter<ClipDoc>()
export const applicationConverter: FirestoreDataConverter<ApplicationDoc>  = makeConverter<ApplicationDoc>()
export const payoutConverter:      FirestoreDataConverter<PayoutDoc>       = makeConverter<PayoutDoc>()
export const socialAccountConverter: FirestoreDataConverter<SocialAccountDoc> = makeConverter<SocialAccountDoc>()
