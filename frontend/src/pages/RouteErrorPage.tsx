import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import ErrorPage from "./ErrorPage";

const RouteErrorPage = () => {
  const error = useRouteError();

  let errorMessage = "An unexpected error occured.";

  if (isRouteErrorResponse(error)) {
    errorMessage = error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  }

  return <ErrorPage error={errorMessage} />;
};

export default RouteErrorPage;
