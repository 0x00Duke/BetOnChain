import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const footballHeaders = {
    'X-RapidAPI-Key': '',
    'X-RapidAPI-Host': 'footapi7.p.rapidapi.com'
};
const baseUrl = 'https://footapi7.p.rapidapi.com';
const createRequest = (url) => ({
    url,
    headers: footballHeaders
});

export const footballApi = createApi({
    reducerPath: 'footballApi',
    baseQuery: fetchBaseQuery({ baseUrl }),
    endpoints: (builder) => ({
        getFootballTeamLogo: builder.query({
            query: () => createRequest(`/api/team/2672/image`)
        }),
    })
});

export const { useGetFootballMatchesQuery, useGetFootballTeamLogoQuery, useGetFootballMatchOddsQuery } = footballApi