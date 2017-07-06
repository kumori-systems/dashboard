/**
 * This file is to test the environment configuration for the correct workflow of karma and chai.
 * If this file works, the config for running karma alone in this environment has been well done.
 */
import { assert } from 'chai';
describe('Trivial Test Cases', () => {
    it('this should be ok', () => {
        const actualValue = true;
        const expectedValue = true;
        const failMessage = 'Message explaining the fail';
        assert.equal(actualValue, expectedValue, failMessage);
    });
});