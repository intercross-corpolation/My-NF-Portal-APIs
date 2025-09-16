const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const connectionString = process.env.AzureWebJobsStorage; // local.settings.jsonから読み込む

//デプロイテスト
app.http('caliinfoupload', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        console.log(`ConnectingStirngs: ${connectionString}`);
        console.log(`PostStert`);
    try {
      
        const data = await request.json(); // リクエストボディからJSONデータを取得
        const { patientInfo, date} = data; // patientInfoとdateを抽出(CalibrationInfoForUploadは未使用のため出力しない)
 // 必須フィールドの抽出
 const { patientId, drId, groupId, age, gender } = patientInfo;

        // ID の検証 (任意)
        if (!patientId || !drId) {
            console.log(`patientId と drId は必須です`);
            return { status: 400, body: "patientId と drId は必須です。" };
        }

        // Azure Blob Storage に接続
     
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('calibrationdatacontainer'); // コンテナ名を指定

        // Blob (ファイル) 名を生成
        const directoryName = `${groupId}/SingleOccupant`; // groupid(病院）をディレクトリ名として使用
        const sanitizedDate = date.replace(/[:/]/g, '-'); 
        const jsonName = `${patientId}_name_${gender}_age_${drId}_C_${sanitizedDate}`;
        const blobName = `${directoryName}/${jsonName}.json`; // ディレクトリ内にファイルを配置
        context.log(`fileName ${blobName} `);
        console.log(`fileName ${blobName} `);
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // JSONデータをアップロード
        const uploadResponse = await blockBlobClient.upload(JSON.stringify(data), Buffer.byteLength(JSON.stringify(data)));

        context.log(`context-Uploaded blob ${blobName} successfully.`);
        console.log(`console-Uploaded blob ${blobName} successfully.`);
        return { body: `データがアップロードされました: ${blobName}` };
    } catch (error) {
        context.log('エラーが発生しました:', error.message);
        context.log(`fileName ${blobName} `);
        console.log(`fileName ${blobName} `);
        return { status: 500, body: 'データの処理中にエラーが発生しました。fileName ${blobName}' };
    }
}
});
