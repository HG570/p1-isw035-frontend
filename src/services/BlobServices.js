import { BlobServiceClient } from "@azure/storage-blob";

const blobSasUrl = import.meta.env.VITE_AZURE_BLOB_SAS_URL;
const containerName = import.meta.env.VITE_AZURE_CONTAINER_NAME;

const blobServiceClient = new BlobServiceClient(blobSasUrl);
const containerClient = blobServiceClient.getContainerClient(containerName);

function generateUniqueBlobName(file) {
  return `${Date.now()}-${file.name}`;
}

export async function uploadVehiclePhoto(file, blobName) {
  try {
    const uniqueName = blobName || generateUniqueBlobName(file);
    const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);

    const options = { blobHTTPHeaders: { blobContentType: file.type } };

    await blockBlobClient.uploadData(file, options);

    const url = `${containerClient.url}/${uniqueName}`;
    return { success: true, url };
  } catch (error) {
    console.error("Erro ao fazer upload do blob:", error);
    return { success: false, error: error.message };
  }
}

export function getBlobUrl(blobName) {
  try {
    const url = `${containerClient.url}/${blobName}`;
    return { success: true, url };
  } catch (error) {
    console.error("Erro ao gerar URL do blob:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteBlob(blobName) {
  try {
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    await blockBlobClient.deleteIfExists();
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar blob:", error);
    return { success: false, error: error.message };
  }
}
