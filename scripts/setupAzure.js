/* eslint-disable no-undef */
import "dotenv/config";
import { BlobServiceClient } from "@azure/storage-blob";
import { TableClient } from "@azure/data-tables";

async function main() {
  try {
    const blobSasUrl = process.env.VITE_AZURE_BLOB_SAS_URL;
    const containerName = process.env.VITE_AZURE_CONTAINER_NAME;

    const tableServiceSasUrl = process.env.VITE_AZURE_TABLE_SERVICE_SAS_URL;
    const tableVeiculos = process.env.VITE_AZURE_TABLE_NAME_VEICULOS;
    const tableClientes = process.env.VITE_AZURE_TABLE_NAME_CLIENTES;
    const tableLocacoes = process.env.VITE_AZURE_TABLE_NAME_LOCACOES;

    const blobServiceClient = new BlobServiceClient(blobSasUrl);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    console.log(`🔹 Verificando container: ${containerName}`);
    await containerClient.createIfNotExists();
    console.log(`✅ Container '${containerName}' pronto.`);

    async function ensureTable(name) {
      const client = new TableClient(tableServiceSasUrl, name);
      console.log(`🔹 Verificando tabela: ${name}`);
      await client.createTable();
      console.log(`✅ Tabela '${name}' pronta.`);
    }

    await ensureTable(tableVeiculos);
    await ensureTable(tableClientes);
    await ensureTable(tableLocacoes);

    console.log("🎉 Infraestrutura criada/verificada com sucesso!");
  } catch (err) {
    console.error("❌ Erro ao criar recursos:", err.message);
  }
}

main();
