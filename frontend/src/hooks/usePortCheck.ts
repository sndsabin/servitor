import { useEffect, useState } from "react";

import { api } from "../api";
import { PortStatus } from "../types";
import { PORT_STATUS } from "../constants";

const TIME_DELAY = 350;

const usePortCheck = (port: number): PortStatus => {
  const [status, setStatus] = useState<PortStatus>(PORT_STATUS.CHECKING);

  useEffect(() => {
    let abort = false;

    setStatus(PORT_STATUS.CHECKING);
    const timer = setTimeout(() => {
      api
        .isPortAvailable(port)
        .then((response) => {
          // Ignore stale responses from previous port checks
          // if the components unmounts or the port changes
          if (!abort) {
            setStatus(response.available);
          }
        })
        .catch((err) => {
          if (!abort) {
            setStatus(true);
          }
        });
    }, TIME_DELAY);

    return () => {
      abort = true;
      clearTimeout(timer);
    };
  }, [port]);

  return status;
};

export default usePortCheck;
