const { app } = require('@azure/functions');
const { BlobServiceClient } = require('@azure/storage-blob');
const connectionString = process.env.AzureWebJobsStorage; // local.settings.jsonから読み込む


app.http('httpTrigger1-2', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        console.log(`ConnectingStirngs: ${connectionString}`);
        console.log(`PostStert`);
    try {
      
        const data = await request.json(); // リクエストボディからJSONデータを取得
        const { subjectId,gender,groupId,drId,date } = data; // 被験者IDとDrIDを抽出

        // ID の検証 (任意)
        if (!subjectId || !drId) {
            console.log(`subjectId と drId は必須です`);
            return { status: 400, body: "subjectId と drId は必須です。" };
        }

        // Azure Blob Storage に接続
     
        const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
        const containerClient = blobServiceClient.getContainerClient('data-container'); // コンテナ名を指定

        // Blob (ファイル) 名を生成
        const directoryName = `${groupId}`; // groupid(病院）をディレクトリ名として使用
        const sanitizedDate = date.replace(/[:/]/g, '-'); 
        const jsonName = `${subjectId}_name_${gender}_age_${drId}_C_${sanitizedDate}`;
        const blobName = `${directoryName}/${jsonName}.json`; // ディレクトリ内にファイルを配置
       
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // JSONデータをアップロード
        const uploadResponse = await blockBlobClient.upload(JSON.stringify(data), Buffer.byteLength(JSON.stringify(data)));

        context.log(`context-Uploaded blob ${blobName} successfully.`);
        console.log(`console-Uploaded blob ${blobName} successfully.`);
        return { body: `データがアップロードされました: ${blobName}` };
    } catch (error) {
        context.log('エラーが発生しました:', error.message);
        return { status: 500, body: 'データの処理中にエラーが発生しました。' };
    }
}
});

