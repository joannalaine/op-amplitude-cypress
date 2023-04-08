export function parseAmplitudeRequests(amplitudeRequests) {
  let amplitudeEvents = [];
  amplitudeRequests.forEach((ampRequest) => {
    const formattedRequest = new URLSearchParams(ampRequest.request);
    const formattedRequestBody = new URLSearchParams(
      formattedRequest.get("body")
    );
    const parsedEvents = JSON.parse(formattedRequestBody.get("e"));
    // Calls to Amplitude can include more than one event
    parsedEvents.forEach((event) => {
      amplitudeEvents.push(event);
    });
  });

  return amplitudeEvents;
}
