const { convert } = require("@algo-builder/algob");
const { types } = require("@algo-builder/web");



const initContract = (runtime, creatorAccount, approvalFile, clearStateFile, locInts, locBytes, gloInts, gloBytes, accs, args) => {
    // create new app
    runtime.deployApp(
        approvalFile,
        clearStateFile,
        {
            sender: creatorAccount,
            localInts: locInts,
            localBytes: locBytes,
            globalInts: gloInts,
            globalBytes: gloBytes,
            accounts: accs,
            appArgs: args,
        },
        { totalFee: 1000 }, //pay flags
    );

    const appInfo = runtime.getAppInfoFromName(approvalFile, clearStateFile);
    const appAddress = appInfo.applicationAccount;  

    // fund the contract
    runtime.executeTx({
        type: types.TransactionType.TransferAlgo,
        sign: types.SignType.SecretKey,
        fromAccount: creatorAccount, //use the account object
        toAccountAddr: appAddress, //app address
        amountMicroAlgos: 2e7, //20 algos
        payFlags: { totalFee: 1000 },
    });

    return appInfo;
};



const optInVesting = (runtime, account, appID, asset) => {
    const optinAsset = ["optin"].map(convert.stringToBytes);
    runtime.executeTx({
        type: types.TransactionType.CallApp,
        sign: types.SignType.SecretKey,
        fromAccount: account,
        appID: appID,
        payFlags: { totalFee: 1000 },
        foreignAssets: [asset],
        appArgs: optinAsset,
    });
};


const transferAsset = (runtime, account, appID, appAccount, assets) => {
    const transfer = [convert.stringToBytes("transferVesting")];
    runtime.executeTx({
        type: types.TransactionType.CallApp,
        sign: types.SignType.SecretKey,
        fromAccount: account,
        appID: appID,
        payFlags: { totalFee: 1000 },
        accounts: [appAccount],
        foreignAssets: [assets],
        appArgs: transfer,
    });
};

const withdrawFromVesting = (runtime,acc, appID,appAccount, assets, amountToWithdraw,buyer,feeCharge) => {
    const withdraw  = [convert.stringToBytes("withdrawFromVesting"),convert.uint64ToBigEndian(amountToWithdraw)];
    runtime.executeTx(
        [
            {
                type: types.TransactionType.TransferAlgo,
                sign: types.SignType.SecretKey,
                fromAccount: buyer,
                toAccountAddr: appAccount,
                amountMicroAlgos: feeCharge, //to cover fee
                payFlags: { totalFee: 1000 },
            },
            {
                type: types.TransactionType.CallApp,
                sign: types.SignType.SecretKey,
                fromAccount: acc,
                appID: appID,
                payFlags: { totalFee: 1000 },
                foreignAssets: [assets],
                appArgs: withdraw,
        
            }
    ]);
};


const saveVestingAddr = (runtime, account, appID, VestingAppAdress) => {
    const save  = ["vestingAccount"].map(convert.stringToBytes);
    const accounts = [VestingAppAdress];
    runtime.executeTx({
        type: types.TransactionType.CallApp,
        sign: types.SignType.SecretKey,
        fromAccount: account,
        appID: appID,
        payFlags: { totalFee: 1000 },
        accounts: accounts,
        appArgs: save,
    });
};


module.exports = {
    initContract,
    optInVesting,
    transferAsset,
    withdrawFromVesting,
    saveVestingAddr
}