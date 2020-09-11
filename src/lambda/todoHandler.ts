import AWS = require('aws-sdk');
import { ITodo } from "../interfaces/todo";
import { Aws } from '@aws-cdk/core';

const tableName = process.env.TABLE_NAME || '';
const dynamo = new AWS.DynamoDB.DocumentClient();

const createResponse = (body: string | AWS.DynamoDB.DocumentClient.ItemList | any, statusCode = 200) => {
    return {
        statusCode,
        body: JSON.stringify(body, null, 2),
    };
};

const getAllTodos = async () => {
    const params: AWS.DynamoDB.DocumentClient.ScanInput = {
        TableName: tableName
    };
    const scanResult = await dynamo.scan(params).promise();
    return scanResult;
};

const getById = async ( id: string) => {
    
    
    const params: AWS.DynamoDB.DocumentClient.GetItemInput = {
        TableName: tableName,
        Key: {
            id: id
        }
    };
    
    const _item = await dynamo.get(params).promise();
    return _item;
};

const addTodoItem = async (data: ITodo) => {
    if (data) await dynamo.put({ TableName: tableName, Item: data }).promise();
    return data;
};

// const deleteTodoItem = async (data: { id: string }) => {
//     const { id } = data;
//     if (id) await dynamo.delete({ TableName: tableName, Key: { id } }).promise();
//     return id;
// };
const deleteTodoItemById = async ( id: string ) => {
    const params: AWS.DynamoDB.DocumentClient.DeleteItemInput = {
        TableName: tableName,
        Key: {
            id: id
        }
    };
    await dynamo.delete(params).promise();
    return id;
};
exports.handler = async function (event: AWSLambda.APIGatewayEvent) {
    try {
        //console.log("request:"+JSON.stringify(event));
        
        const { httpMethod, body: requestBody } = event;

        const eventData:any = event;

        if (httpMethod === 'GET') {
            const todoId:string  = eventData.pathParameters.todoId || "";
            
            const response = await getById(todoId);
            return createResponse(response.Item, 200);
        }

        if (httpMethod === 'DELETE') {
            const todoId:string  = eventData.pathParameters.todoId || "";
            const todoResult = await deleteTodoItemById(todoId);
            const _todo = {'id':todoResult};
            return _todo
                ? createResponse(`${JSON.stringify(_todo)} deleted from the database`)
                : createResponse('Todo is missing', 500);
        }

        if (!requestBody) {
            return createResponse('Missing request body', 500);
        }

        const data = JSON.parse(requestBody);

        if (httpMethod === 'PUT') {
            const _todo = await addTodoItem(data);
            return _todo
                ? createResponse(`${JSON.stringify(data)} added to the database`)
                : createResponse('Todo is missing', 500);
        }

        

        return createResponse(`Ops, something wrong!`, 500);
    } catch (error) {
        console.log(error);
        return createResponse(error, 500);
    }
};
exports.handlerList = async function (event: AWSLambda.APIGatewayEvent) {
    try {
        console.log("request:"+JSON.stringify(event));

        const { httpMethod, body: requestBody } = event;

        if (httpMethod === 'GET') {
            const response = await getAllTodos();
            return createResponse(response.Items || []);
        }

        

        return createResponse(`Ops, something wrong!`, 500);
    } catch (error) {
        console.log(error);
        return createResponse(error, 500);
    }
};