import { useCallback, useState } from "react";
import { toast } from "sonner";
import { TOAST_ERROR, TOAST_WARNING } from "../../constants/shared";

export const useApi = ({ fetchFunction, schema }) => {
    const [isLoading, setLoading] = useState(false);

    const query = useCallback(async (params = {}) => {
        try {
            setLoading(true);

            const response = await fetchFunction(params);

            if (!`${response.status}`.startsWith("2")) {
                toast.warning(TOAST_WARNING.STATUS_KO);
                return null;
            }

            let parsedData = response.data;

            if (schema) {
                const result = schema.safeParse(response.data);

                if (!result.success) {
                    console.error(result.error);
                    toast.error(TOAST_ERROR.INVALID_RESPONSE_SCHEMA);
                    return null;
                }

                parsedData = result.data;
            }

            return parsedData;
        } catch (e) {
            console.error(e);
            toast.error(TOAST_ERROR.UNEXPECTED_ERROR);
            return null;
        } finally {
            setLoading(false);
        }
    }, [fetchFunction, schema]);

    return {
        isLoading,
        query,
    };
};