const bunyan = require('bunyan');
const request = require('request-promise-native');
const xml2js = require('xml2js');
const util = require('util');
const parseXml = util.promisify(xml2js.parseString);
const AWS = require('aws-sdk');
const S3 = new AWS.S3();

exports.handler = async (event, context) => {
	try {

		let log = bunyan.createLogger({name: 'lambda-example', requestId: context.awsRequestId});

		log.info({
			event: event,
			context: context
		});

		// let rail = new Rail();

		// rail.getDepartureBoard('TFC', {}, function(err,result){
		// 	//do stuff
		// });

		log.info('Authenticating to obtain an access token');
		let rawTokenData = await request.post('https://datafeeds.nationalrail.co.uk/authenticate').form({
			username: process.env['NRDP_USER'],
			password: process.env['NRDP_PASS']
		});

		let tokenData = JSON.parse(rawTokenData);
		let token = tokenData.token;

		log.info('Retrieving station listings');
		let rawStationData = await request.get({
			url: 'https://datafeeds.nationalrail.co.uk/api/staticfeeds/4.0/stations',
			headers: {
				"X-Auth-Token": token
			}
		});

		log.info('Parsing station listing XML');
		let processedStationData = await parseXml(rawStationData, {
				explicitArray:false
			});

		log.info('Adapting station listings to DTO');
		let stations = [];
		for (let rawStation of processedStationData.StationList.Station)
		{
			let station = {
				crsCode: rawStation.CrsCode,
				name: rawStation.Name,
				latitude: rawStation.Latitude,
				longitude: rawStation.Longitude
			};

			stations.push(station);
		}

		log.info('Persisting station details in S3');
		await S3.putObject({
			Bucket: process.env['S3_BUCKET_NAME'],
			Key: 'station-data.json',
			ContentType:'text/json',
			Body: JSON.stringify(stations)
		}).promise();

		// request.get('https://datafeeds.nationalrail.co.uk/darwin/api/staticfeeds/4.0/stations').auth('james@gawn.uk', 'VeC-63V-4hc-LGJ').then((data) => {
		//
		// }).catch((error) => {
		//
		// });

		return stations;

	} catch (err) {

		Promise.reject(err);

	}
};