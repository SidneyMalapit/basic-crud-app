export function addRow(type) {
    return (item) => {
        delete item.id;
        return fetch(`/api/${type}s`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(item)
        }).then((res) => res.json());
    };
}
export function deleteRow(type) {
    return (id) => {
        return fetch(`/api/${type}s/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((res) => res.json());
    };
}
