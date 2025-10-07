import { TableClient, AzureSASCredential } from "@azure/data-tables";
import { v4 as uuidv4 } from "uuid";

const sasUrl = import.meta.env.VITE_AZURE_TABLE_SERVICE_SAS_URL;
const [accountUrl, sasTokenRaw] = sasUrl.split("?");
const sasToken = sasTokenRaw || ""; 

const credential = new AzureSASCredential(sasToken);

const tableVeiculos = import.meta.env.VITE_AZURE_TABLE_NAME_VEICULOS;
const tableClientes = import.meta.env.VITE_AZURE_TABLE_NAME_CLIENTES;
const tableLocacoes = import.meta.env.VITE_AZURE_TABLE_NAME_LOCACOES;

const PARTITION_KEY = "rafaelPinheiro";

const veiculosClient = new TableClient(accountUrl, tableVeiculos, credential);
const clientesClient = new TableClient(accountUrl, tableClientes, credential);
const locacoesClient = new TableClient(accountUrl, tableLocacoes, credential);

function handleError(error) {
  console.error(error);
  return { success: false, error: error.message };
}

function generateRowKey() {
  return uuidv4();
}

// Veículos
export async function createVehicle(vehicle) {
  try {
    const entity = {
      partitionKey: PARTITION_KEY,
      rowKey: generateRowKey(),
      ...vehicle,
      fotos: JSON.stringify(vehicle.fotos || []),
      disponibilidade: vehicle.disponibilidade ?? true,
    };
    await veiculosClient.createEntity(entity);
    return { success: true, data: entity };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateVehicle(partitionKey, rowKey, updates) {
  try {
    await veiculosClient.updateEntity(
      { partitionKey, rowKey, ...updates },
      "Merge"
    );
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteVehicle(partitionKey, rowKey) {
  try {
    await veiculosClient.deleteEntity(partitionKey, rowKey);
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function listVehicles(filterOptions = {}) {
  try {
    let filter = `PartitionKey eq '${PARTITION_KEY}'`;
    if (filterOptions.marca) filter += ` and marca eq '${filterOptions.marca}'`;
    if (filterOptions.modelo) filter += ` and modelo eq '${filterOptions.modelo}'`;
    if (filterOptions.disponibilidade !== undefined)
      filter += ` and disponibilidade eq ${filterOptions.disponibilidade}`;

    const entities = [];
    for await (const entity of veiculosClient.listEntities({ queryOptions: { filter } })) {
      entities.push({
        ...entity,
        fotos: entity.fotos ? JSON.parse(entity.fotos) : [],
      });
    }
    return { success: true, data: entities };
  } catch (error) {
    return handleError(error);
  }
}

export async function getVehicleById(partitionKey, rowKey) {
  try {
    const entity = await veiculosClient.getEntity(partitionKey, rowKey);
    return {
      success: true,
      data: { ...entity, fotos: entity.fotos ? JSON.parse(entity.fotos) : [] },
    };
  } catch (error) {
    return handleError(error);
  }
}

// Clientes
export async function createCliente(cliente) {
  try {
    const entity = {
      partitionKey: PARTITION_KEY,
      rowKey: generateRowKey(),
      ...cliente,
    };
    await clientesClient.createEntity(entity);
    return { success: true, data: entity };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateCliente(partitionKey, rowKey, updates) {
  try {
    await clientesClient.updateEntity(
      { partitionKey, rowKey, ...updates },
      "Merge"
    );
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteCliente(partitionKey, rowKey) {
  try {
    await clientesClient.deleteEntity(partitionKey, rowKey);
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function listClientes() {
  try {
    const entities = [];
    for await (const entity of clientesClient.listEntities({
      queryOptions: { filter: `PartitionKey eq '${PARTITION_KEY}'` },
    })) {
      entities.push(entity);
    }
    return { success: true, data: entities };
  } catch (error) {
    return handleError(error);
  }
}

export async function getClienteById(partitionKey, rowKey) {
  try {
    const entity = await clientesClient.getEntity(partitionKey, rowKey);
    return { success: true, data: entity };
  } catch (error) {
    return handleError(error);
  }
}

export async function getHistoricoLocacoesCliente(clientePartitionKey, clienteRowKey) {
  try {
    const filter = `PartitionKey eq '${PARTITION_KEY}' and fk_cliente_id eq '${clienteRowKey}'`;
    const entities = [];
    for await (const entity of locacoesClient.listEntities({ queryOptions: { filter } })) {
      entities.push(entity);
    }
    return { success: true, data: entities };
  } catch (error) {
    return handleError(error);
  }
}

// Locações
export async function createLocacao(locacao) {
  try {
    const entity = {
      partitionKey: PARTITION_KEY,
      rowKey: generateRowKey(),
      ...locacao,
      horario_inicio: new Date(locacao.horario_inicio).toISOString(),
      horario_fim: new Date(locacao.horario_fim).toISOString(),
    };
    await locacoesClient.createEntity(entity);
    return { success: true, data: entity };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateLocacao(partitionKey, rowKey, updates) {
  try {
    if (updates.horario_inicio)
      updates.horario_inicio = new Date(updates.horario_inicio).toISOString();
    if (updates.horario_fim)
      updates.horario_fim = new Date(updates.horario_fim).toISOString();

    await locacoesClient.updateEntity(
      { partitionKey, rowKey, ...updates },
      "Merge"
    );
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function cancelLocacao(partitionKey, rowKey) {
  try {
    await locacoesClient.updateEntity(
      { partitionKey, rowKey, status: "cancelada" },
      "Merge"
    );
    return { success: true };
  } catch (error) {
    return handleError(error);
  }
}

export async function listLocacoes(filterOptions = {}) {
  try {
    let filter = `PartitionKey eq '${PARTITION_KEY}'`;
    if (filterOptions.status) filter += ` and status eq '${filterOptions.status}'`;
    if (filterOptions.fk_cliente_id)
      filter += ` and fk_cliente_id eq '${filterOptions.fk_cliente_id}'`;
    if (filterOptions.fk_veiculo_id)
      filter += ` and fk_veiculo_id eq '${filterOptions.fk_veiculo_id}'`;

    const entities = [];
    for await (const entity of locacoesClient.listEntities({ queryOptions: { filter } })) {
      entities.push(entity);
    }
    return { success: true, data: entities };
  } catch (error) {
    return handleError(error);
  }
}
