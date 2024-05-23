import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";

const sesClient = new SESClient({});

export async function handler() {
  await sesClient.send(
    new SendEmailCommand({
      Source: "no-reply@cdk-course.jsherz.com",
      Destination: {
        ToAddresses: ["james@jsherz.com"],
      },
      Message: {
        Body: {
          Text: {
            Data: "It's time to brush your teeth!",
            Charset: "utf-8",
          },
        },
        Subject: {
          Data: "Brush your teeth!",
          Charset: "utf-8",
        },
      },
    }),
  );
}
