module.exports.eventsListener = function(event, context) {
  console.log(JSON.stringify(event, null, 2));

  //Check for the event type
  if (event.eventType === 'SyncTrigger') {
    //Modify value for a key
    console.log(event.datasetRecords);
  }
  context.done(null, event);
};
