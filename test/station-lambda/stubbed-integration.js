const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const path = require('path');
const nock = require('nock');
const util = require('util');
const readFile = util.promisify(fs.readFile);
chai.use(require('sinon-chai'));

let lambda = require('../../station-lambda');

describe('Station Lambda Stubbed Integration Tests', () => {

	beforeEach(async () => {
		nock.disableNetConnect();
		nock('https://datafeeds.nationalrail.co.uk').post('/authenticate', {
			username: process.env['NRDP_USER'],
			password: process.env['NRDP_PASS']
		}).replyWithFile(200, __dirname + '/data/static-data-token-response.json');

		nock('https://datafeeds.nationalrail.co.uk', {
			reqheaders: {
				"X-Auth-Token": 'alice@noone.com:1528708426871:837a028e104dbf3534ca0f8ab2f09'
			}
		}).get('/api/staticfeeds/4.0/stations').replyWithFile(200, __dirname + '/data/station-data-partial-raw.xml');

		nock('https://rail-service-bucket.s3.amazonaws.com:443', {"encodedQueryParams":true})
			.put('/station-data.json')
			.reply(400, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<Error><Code>AuthorizationHeaderMalformed</Code><Message>The authorization header is malformed; the region 'us-east-1' is wrong; expecting 'eu-west-2'</Message><Region>eu-west-2</Region><RequestId>5733AD12051A6567</RequestId><HostId>/GqaaG6/wfwf/TOfH0BwWoecXj1Y1y3CQMQ6FO/M/tNy7ZTUOnw81M+CI=</HostId></Error>", [ 'x-amz-request-id',
				'5733AD12051A6567',
				'x-amz-id-2',
				'/GqaaG6/asdsad/TOfH0BwWoecXj1Y1y3CQMQ6FO/M/tNy7ZTUOnw81M+CI=',
				'Content-Type',
				'application/xml',
				'Transfer-Encoding',
				'chunked',
				'Date',
				'Wed, 13 Jun 2018 15:38:05 GMT',
				'Connection',
				'close',
				'Server',
				'AmazonS3' ]);

		nock('https://rail-service-bucket.s3.amazonaws.com:443', {"encodedQueryParams":true})
			.put('/station-data.json')
			.reply(200, "", [ 'x-amz-id-2',
				'sdfsf+vyPPGLexlIU5cH/xiUmTYJR77SZKXsc=',
				'x-amz-request-id',
				'5EADE8C5CBECF290',
				'Date',
				'Wed, 13 Jun 2018 15:38:06 GMT',
				'ETag',
				'"8c26f67916998d0b1472ae40f0728e73"',
				'Content-Length',
				'0',
				'Server',
				'AmazonS3' ]);

	});

	describe('handler', () => {
		it('successfully response for handler', async () => {
			let event = JSON.parse(await readFile(path.join(__dirname + '/data/example-event.json')));
			let context = JSON.parse(await readFile(path.join(__dirname + '/data/example-context.json')));

			let result = await lambda.handler(event, context);

			return expect(result).to.deep.equal(JSON.parse(await readFile(path.join(__dirname + '/data/station-data-processed.json'))));
		});

	});

});