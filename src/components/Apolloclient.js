import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { from } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'https://learn.reboot01.com/api/graphql-engine/v1/graphql',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('token'); // string or JSON — either is fine for header
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

// 🔎 loud logging for anything failing inside Apollo
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach((e) => {
      console.error('[GraphQL error]', {
        op: operation.operationName,
        message: e.message,
        locations: e.locations,
        path: e.path,
        extensions: e.extensions,
      });
    });
  }
  if (networkError) {
    console.error('[Network error]', networkError);
  }
});

const client = new ApolloClient({
  link: from([errorLink, authLink.concat(httpLink)]),
  cache: new InMemoryCache(),
});

export default client;
