import { useState, useMemo } from "react";

const normalizeValue = (value) => {
    if (value === null || value === undefined) return null;
    if (typeof value === "number" || typeof value === "boolean") return value;

    const stringValue = String(value).trim();
    if (stringValue === "") return null;

    const numericValue = Number(stringValue);
    return Number.isNaN(numericValue)
        ? stringValue.toLocaleLowerCase()
        : numericValue;
};

const collator = new Intl.Collator(undefined, {
    numeric: true,
    sensitivity: "base",
});

export const useSortableData = (
    items = [],
    defaultConfig = { key: null, direction: "asc" },
) => {
    const [sortConfig, setSortConfig] = useState(defaultConfig);

    const sortedItems = useMemo(() => {
        if (!Array.isArray(items)) return [];
        let sortableItems = [...items];
        if (sortConfig.key !== null) {
            sortableItems.sort((a, b) => {
                const aValue = normalizeValue(a[sortConfig.key]);
                const bValue = normalizeValue(b[sortConfig.key]);

                if (aValue === bValue) return 0;
                if (aValue === null) return 1;
                if (bValue === null) return -1;

                const result =
                    typeof aValue === "number" && typeof bValue === "number"
                        ? aValue - bValue
                        : collator.compare(String(aValue), String(bValue));
                return sortConfig.direction === "asc" ? result : -result;
            });
        }
        return sortableItems;
    }, [items, sortConfig]);

    const requestSort = (key) => {
        let direction = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    return { items: sortedItems, requestSort, sortConfig };
};

export default useSortableData;
