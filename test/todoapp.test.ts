import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as Todoapp from '../lib/todoapp-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Todoapp.TodoappStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
