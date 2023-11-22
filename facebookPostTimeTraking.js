const moment = require('moment');

const createdAt = getOpportunities[0]?.createdAt;
const formattedTime = moment(createdAt).fromNow();
console.log(formattedTime);