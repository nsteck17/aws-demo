import {create_table, insert_to_table, list_tables, query_table, scan_table} from "./index";

const table = {
    "AttributeDefinitions": [
        {
            "AttributeName": "Artist",
            "AttributeType": "S"
        },
        {
            "AttributeName": "SongTitle",
            "AttributeType": "S"
        }
    ],
    "KeySchema": [
        {
            "AttributeName": "Artist",
            "KeyType": "HASH"
        },
        {
            "AttributeName": "SongTitle",
            "KeyType": "RANGE"
        }
    ],
    "ProvisionedThroughput": {
        "ReadCapacityUnits": 5,
        "WriteCapacityUnits": 5
    },
    "TableName": "Music"
};


const item = {
    TableName: 'Music',
    Item:
        {Artist: "Jay", SongTitle: "ABC", genre: "blue"}
}

const queryItem = {
    TableName: "Music",
        KeyConditionExpression:
    "Artist = :name",
        ExpressionAttributeValues: {
            ":name":{S:"Jay"}
        },
    ConsistentRead: true,
}


const main = async () => {
    // console.log("list: ", await list_tables());
    // console.log("create: ", await create_table(table));
    // console.log("list: ", await list_tables());

    // console.log("insert: ", await insert_to_table(item));
    // console.log('aaa', await scan_table(table.TableName))
    //console.log('query item', (await (query_table(queryItem))).Items);

}
main();
