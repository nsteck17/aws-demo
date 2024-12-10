import {
    ListTablesCommand,
    DynamoDBClient,
    CreateTableCommand,
    DescribeTableCommand,
    ScanCommand, QueryCommand
} from "@aws-sdk/client-dynamodb";
import {
    KeySchemaElement,
    AttributeDefinition,
    TableDescription,
    AttributeValue
} from "@aws-sdk/client-dynamodb/dist-types/models";
import {DeleteCommand, PutCommand, QueryCommandInput} from "@aws-sdk/lib-dynamodb";
import {DeleteCommandInput} from "@aws-sdk/lib-dynamodb/dist-types/commands";


export type TableType = {
    TableName: string;
    AttributeDefinitions: AttributeDefinition[];
    KeySchema: KeySchemaElement[];
};

export type TableInsertType = {
    TableName: string;
    Item: any;
}

const client = new DynamoDBClient({});

export const list_tables = async () => {

    const response = await client.send(new ListTablesCommand({}));
    if (!response.TableNames) return [];
    const tables: TableDescription[] = [];
    for (const TableName of response.TableNames) {
        const res = await client.send(new DescribeTableCommand({TableName}));
        if (res.Table) tables.push(res.Table);
    }
    return tables;
};

export const create_table = async (table: TableType) => {
    const command = new CreateTableCommand(table);
    return client.send(command).then(res => res).catch(e => e);
};

export const query_table = async (item: QueryCommandInput) => {
    const command = new QueryCommand(item);
    return client.send(command).then(res => res).catch(e => e);
}


export const insert_to_table = async (tableItem: TableInsertType) => {
    const command = new PutCommand(tableItem);
    return client.send(command).then(res => "Inserted").catch(e => `Failed to create\n${e}`);
};

export type ScanTableType = "" | {
    Table: TableDescription;
    Items: Record<string, AttributeValue>[] | undefined;
    Count: number | undefined;
}

export const scan_table = async (TableName: string) => {
    const command = new ScanCommand({TableName});
    const {Table} = await client.send(new DescribeTableCommand({TableName}));
    if (!Table || !Table.AttributeDefinitions) return '';
    const {Items, Count} = await client.send(command);
    if (!Items) return {Table, Items, Count};
    const columns: { [k: string]: any }[] = [];
    for (const item of Items) {
        const column: { [k: string]: any } = {};
        for (const {AttributeName, AttributeType} of Table.AttributeDefinitions) {
            if (AttributeName) {
                const val: AttributeValue = item[AttributeName]
                if (AttributeType)
                    column[AttributeName] = val[AttributeType as keyof AttributeValue]
            }
        }
        columns.push(column);
    }
    return {Table, Items: columns, Count};
}


export const delete_item = async (item: DeleteCommandInput) => {
    const command = new DeleteCommand(item);

    const response = await client.send(command);
    console.log(response);
    return response;
}


