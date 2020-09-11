import * as cdk from '@aws-cdk/core';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class TodoappStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const todoTable = new dynamodb.Table(this, 'todo', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      //billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      tableName: 'todo'
    });

    const todoLambda = new lambda.Function(this, 'TodoHandler', {
      code: lambda.Code.fromAsset('src/lambda'),
      handler: 'todoHandler.handler',
      runtime: lambda.Runtime.NODEJS_12_X,      
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: todoTable.tableName,
      },
    });
    const todosLambda = new lambda.Function(this, 'TodosHandler', {
      code: lambda.Code.fromAsset('src/lambda'),
      handler: 'todoHandler.handlerList',
      runtime: lambda.Runtime.NODEJS_12_X,      
      memorySize: 256,
      timeout: cdk.Duration.seconds(10),
      environment: {
        TABLE_NAME: todoTable.tableName,
      },
    });

    todoTable.grantReadWriteData(todoLambda);
    todoTable.grantReadWriteData(todosLambda);


    const api = new apigateway.RestApi(this,"todo-api");
    // const api = new apigateway.RestApi(this,"todo-api", {
    //   deployOptions: {
    //     stageName: 'dev'
    //   }
    // });

    

    const todoResource =api.root.resourceForPath("todo");
    todoResource.addMethod("PUT", new apigateway.LambdaIntegration(todoLambda));
    
    const getDeleteTodo = todoResource.addResource('{todoId}');
    getDeleteTodo.addMethod("GET", new apigateway.LambdaIntegration(todoLambda));
    getDeleteTodo.addMethod("DELETE", new apigateway.LambdaIntegration(todoLambda));
    
    


    api.root
    .resourceForPath("todos")
    .addMethod("GET", new apigateway.LambdaIntegration(todosLambda));

    // new cdk.CfnOutput(this, "HTTP API URL",{
    //   value: api.url ?? "Something went wrong with deploy"
    // });

    // new apigateway.LambdaRestApi(this, 'TodoEndpoint', {
    //   handler: todoLambda,
    // });

    // The code that defines your stack goes here
  }
}
