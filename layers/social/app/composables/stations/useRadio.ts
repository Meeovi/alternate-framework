export const useRadio =() => {

    const getStations = async () => {
        const response = await fetch('/api/radio/stations')
        return await response.json()
    }

    const getStationById = async (id: string) => {
        const response = await fetch(`/api/radio/stations/${id}`)
        return await response.json()
    }

    const createStation = async (station: any) => {
        const response = await fetch('/api/radio/stations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(station)
        })
        return await response.json()
    }

    const updateStation = async (id: string, station: any) => {
        const response = await fetch(`/api/radio/stations/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(station)
        })
        return await response.json()
    }

    const deleteStation = async (id: string) => {
        const response = await fetch(`/api/radio/stations/${id}`, {
            method: 'DELETE'
        })
        return await response.json()
    }

    return {
        getStations,
        getStationById,
        createStation,
        updateStation,
        deleteStation
    }
}