import { StayGori } from "@/app/_hooks/useStayGori";
import { useEffect, useState } from "react";
import { OkigoResult } from "./okigoResult";
import { Pagination } from '@mantine/core';

interface Props {
    staygoriList: StayGori[];
};

export const OkigoResultList = ({ staygoriList }: Props) => {
    const [activePage, setPage] = useState(1);

    const activePageChanged = (value: number) => {
        setPage(value);
    }
    return (
        <>
            <>
                <OkigoResult stayGori={staygoriList[activePage - 1]} />
                <Pagination value={activePage} onChange={activePageChanged} total={staygoriList.length} />
            </>
        </>
    );

}