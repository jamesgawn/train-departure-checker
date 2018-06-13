const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');
const nock = require('nock');
chai.use(require('sinon-chai'));

let lambda = require('../../station-lambda');

describe('Lambda Test', () => {

	beforeEach(() => {
		nock.recorder.rec();
	});

	describe('handler', () => {
		it('successfully responds for handler', async () => {
			event = JSON.parse(fs.readFileSync(path.join(__dirname + '/data/example-event.json')), 'utf8');
			context = JSON.parse(fs.readFileSync(path.join(__dirname + '/data/example-context.json')), 'utf8');

			let result = await lambda.handler(event, context);

			return expect(result).to.equal('Hello World');
		});

	});

});