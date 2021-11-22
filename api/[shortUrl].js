import { GraphQLClient, gql } from "graphql-request";

const graphcms = new GraphQLClient(process.env.GRAPHCMS_ENDPOINT, {
  headers: {
    Authorization: `Bearer ${process.env.GRAPHCMS_TOKEN}`,
  },
});

const GetLinkByShortUrlQuery = gql`
  query GetLinkByShortUrl($shortUrl: String!) {
    link(where: { shortUrl: $shortUrl }) {
      id
      destinationUrl
    }
  }
`;

const CreateNewVisitForLinkMutation = gql`
  mutation CreateNewVisitForLink($linkId: ID!) {
    createVisit(data: { link: { connect: { id: $linkId } } }) {
      id
    }
  }
`;

export default async function handler(req, res) {
  const { shortUrl } = req.query;

  try {
    const {
      link: { id: linkId, destinationUrl },
    } = await graphcms.request(GetLinkByShortUrlQuery, { shortUrl });

    await graphcms.request(CreateNewVisitForLinkMutation, {
      linkId,
    });

    res.status(301).redirect(destinationUrl);
  } catch (err) {
    res.status(404).end("Not Found");
  }
}
