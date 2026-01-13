// Generated from Main.daml
/* eslint-disable @typescript-eslint/camelcase */
/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable @typescript-eslint/no-use-before-define */
import * as jtv from '@mojotech/json-type-validation';
import * as damlTypes from '@daml/types';
/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
import * as damlLedger from '@daml/ledger';

import * as pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662 from '@daml.js/d14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662';

export declare type Cancel = {
};

export declare const Cancel:
  damlTypes.Serializable<Cancel> & {
  }
;


export declare type Reject = {
};

export declare const Reject:
  damlTypes.Serializable<Reject> & {
  }
;


export declare type Accept = {
};

export declare const Accept:
  damlTypes.Serializable<Accept> & {
  }
;


export declare type TransferProposal = {
  asset: Asset;
  sender: damlTypes.Party;
  receiver: damlTypes.Party;
  proposedAt: damlTypes.Time;
};

export declare interface TransferProposalInterface {
  Accept: damlTypes.Choice<TransferProposal, Accept, damlTypes.ContractId<Asset>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferProposal, undefined>>;
  Reject: damlTypes.Choice<TransferProposal, Reject, damlTypes.ContractId<Asset>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferProposal, undefined>>;
  Archive: damlTypes.Choice<TransferProposal, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferProposal, undefined>>;
  Cancel: damlTypes.Choice<TransferProposal, Cancel, damlTypes.ContractId<Asset>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<TransferProposal, undefined>>;
}
export declare const TransferProposal:
  damlTypes.Template<TransferProposal, undefined, '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:TransferProposal'> &
  damlTypes.ToInterface<TransferProposal, never> &
  TransferProposalInterface;

export declare namespace TransferProposal {
  export type CreateEvent = damlLedger.CreateEvent<TransferProposal, undefined, typeof TransferProposal.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<TransferProposal, typeof TransferProposal.templateId>
  export type Event = damlLedger.Event<TransferProposal, undefined, typeof TransferProposal.templateId>
  export type QueryResult = damlLedger.QueryResult<TransferProposal, undefined, typeof TransferProposal.templateId>
}



export declare type ProposeTransfer = {
  newOwner: damlTypes.Party;
};

export declare const ProposeTransfer:
  damlTypes.Serializable<ProposeTransfer> & {
  }
;


export declare type Asset = {
  owner: damlTypes.Party;
  description: string;
  createdAt: damlTypes.Time;
  observers: damlTypes.Party[];
};

export declare interface AssetInterface {
  ProposeTransfer: damlTypes.Choice<Asset, ProposeTransfer, damlTypes.ContractId<TransferProposal>, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Asset, undefined>>;
  Archive: damlTypes.Choice<Asset, pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive, {}, undefined> & damlTypes.ChoiceFrom<damlTypes.Template<Asset, undefined>>;
}
export declare const Asset:
  damlTypes.Template<Asset, undefined, '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset'> &
  damlTypes.ToInterface<Asset, never> &
  AssetInterface;

export declare namespace Asset {
  export type CreateEvent = damlLedger.CreateEvent<Asset, undefined, typeof Asset.templateId>
  export type ArchiveEvent = damlLedger.ArchiveEvent<Asset, typeof Asset.templateId>
  export type Event = damlLedger.Event<Asset, undefined, typeof Asset.templateId>
  export type QueryResult = damlLedger.QueryResult<Asset, undefined, typeof Asset.templateId>
}


