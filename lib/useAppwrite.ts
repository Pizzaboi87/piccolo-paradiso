import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";

interface UseAppwriteOptions<T, P extends Record<string, string | number>> {
    fn: (params: P) => Promise<T>;
    params?: P;
    skip?: boolean;
}

interface UseAppwriteReturn<T, P> {
    data: T | null;
    loading: boolean;
    error: string | null;
    refetch: (newParams?: P) => Promise<void>;
}

const useAppwrite = <T, P extends Record<string, string | number>>({
    fn,
    params = {} as P,
    skip = false,
}: UseAppwriteOptions<T, P>): UseAppwriteReturn<T, P> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(!skip);
    const [error, setError] = useState<string | null>(null);
    const fnRef = useRef(fn);
    const paramsRef = useRef(params);

    useEffect(() => {
        fnRef.current = fn;
    }, [fn]);

    useEffect(() => {
        paramsRef.current = params;
    }, [params]);

    const fetchData = useCallback(
        async (fetchParams: P) => {
            setLoading(true);
            setError(null);

            try {
                const result = await fnRef.current({ ...fetchParams });
                setData(result);
            } catch (err: unknown) {
                const errorMessage =
                    err instanceof Error ? err.message : "Ismeretlen hiba történt";
                setError(errorMessage);
                Alert.alert("Hiba", errorMessage);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    useEffect(() => {
        if (!skip) {
            fetchData(paramsRef.current);
        }
    }, [skip, fetchData]);

    const refetch = useCallback(async (newParams?: P) => {
        await fetchData((newParams ?? paramsRef.current) as P);
    }, [fetchData]);

    return { data, loading, error, refetch };
};

export default useAppwrite;
