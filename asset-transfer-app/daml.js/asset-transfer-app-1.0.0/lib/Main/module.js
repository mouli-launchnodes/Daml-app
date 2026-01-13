"use strict";
/* eslint-disable-next-line no-unused-vars */
function __export(m) {
/* eslint-disable-next-line no-prototype-builtins */
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable-next-line no-unused-vars */
var jtv = require('@mojotech/json-type-validation');
/* eslint-disable-next-line no-unused-vars */
var damlTypes = require('@daml/types');
/* eslint-disable-next-line no-unused-vars */
var damlLedger = require('@daml/ledger');

var pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662 = require('@daml.js/d14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662');


exports.Cancel = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.Reject = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.Accept = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({}); }),
  encode: function (__typed__) {
  return {
  };
}
,
};



exports.TransferProposal = damlTypes.assembleTemplate(
{
  templateId: '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:TransferProposal',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({asset: exports.Asset.decoder, sender: damlTypes.Party.decoder, receiver: damlTypes.Party.decoder, proposedAt: damlTypes.Time.decoder, }); }),
  encode: function (__typed__) {
  return {
    asset: exports.Asset.encode(__typed__.asset),
    sender: damlTypes.Party.encode(__typed__.sender),
    receiver: damlTypes.Party.encode(__typed__.receiver),
    proposedAt: damlTypes.Time.encode(__typed__.proposedAt),
  };
}
,
  Accept: {
    template: function () { return exports.TransferProposal; },
    choiceName: 'Accept',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Accept.decoder; }),
    argumentEncode: function (__typed__) { return exports.Accept.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Asset).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Asset).encode(__typed__); },
  },
  Reject: {
    template: function () { return exports.TransferProposal; },
    choiceName: 'Reject',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Reject.decoder; }),
    argumentEncode: function (__typed__) { return exports.Reject.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Asset).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Asset).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.TransferProposal; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
  Cancel: {
    template: function () { return exports.TransferProposal; },
    choiceName: 'Cancel',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.Cancel.decoder; }),
    argumentEncode: function (__typed__) { return exports.Cancel.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.Asset).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.Asset).encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.TransferProposal, ['3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2', '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2']);



exports.ProposeTransfer = {
  decoder: damlTypes.lazyMemo(function () { return jtv.object({newOwner: damlTypes.Party.decoder, }); }),
  encode: function (__typed__) {
  return {
    newOwner: damlTypes.Party.encode(__typed__.newOwner),
  };
}
,
};



exports.Asset = damlTypes.assembleTemplate(
{
  templateId: '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2:Main:Asset',
  keyDecoder: damlTypes.lazyMemo(function () { return jtv.constant(undefined); }),
  keyEncode: function () { throw 'EncodeError'; },
  decoder: damlTypes.lazyMemo(function () { return jtv.object({owner: damlTypes.Party.decoder, description: damlTypes.Text.decoder, createdAt: damlTypes.Time.decoder, observers: damlTypes.List(damlTypes.Party).decoder, }); }),
  encode: function (__typed__) {
  return {
    owner: damlTypes.Party.encode(__typed__.owner),
    description: damlTypes.Text.encode(__typed__.description),
    createdAt: damlTypes.Time.encode(__typed__.createdAt),
    observers: damlTypes.List(damlTypes.Party).encode(__typed__.observers),
  };
}
,
  ProposeTransfer: {
    template: function () { return exports.Asset; },
    choiceName: 'ProposeTransfer',
    argumentDecoder: damlTypes.lazyMemo(function () { return exports.ProposeTransfer.decoder; }),
    argumentEncode: function (__typed__) { return exports.ProposeTransfer.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.ContractId(exports.TransferProposal).decoder; }),
    resultEncode: function (__typed__) { return damlTypes.ContractId(exports.TransferProposal).encode(__typed__); },
  },
  Archive: {
    template: function () { return exports.Asset; },
    choiceName: 'Archive',
    argumentDecoder: damlTypes.lazyMemo(function () { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.decoder; }),
    argumentEncode: function (__typed__) { return pkgd14e08374fc7197d6a0de468c968ae8ba3aadbf9315476fd39071831f5923662.DA.Internal.Template.Archive.encode(__typed__); },
    resultDecoder: damlTypes.lazyMemo(function () { return damlTypes.Unit.decoder; }),
    resultEncode: function (__typed__) { return damlTypes.Unit.encode(__typed__); },
  },
}

);


damlTypes.registerTemplate(exports.Asset, ['3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2', '3871bbf7cc5081b11362b3f94db3563d34f3e61465fc4032798a77c406a862b2']);

