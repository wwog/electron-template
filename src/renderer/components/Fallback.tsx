import { FC } from "react";
import { FallbackProps } from "react-error-boundary";

export const FallbackComponent: FC<FallbackProps> = (props) => {
  // Call resetErrorBoundary() to reset the error boundary and retry the render.
  const { error, resetErrorBoundary } = props;
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre style={{ color: "red" }}>{error.message}</pre>
      <button onClick={resetErrorBoundary}>ResetErrorBoundary</button>
    </div>
  );
};
