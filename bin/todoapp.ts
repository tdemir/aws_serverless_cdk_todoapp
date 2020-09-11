#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { TodoappStack } from '../lib/todoapp-stack';

const app = new cdk.App();
new TodoappStack(app, 'TodoappStack');
