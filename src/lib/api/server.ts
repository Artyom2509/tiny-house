interface Body<TVariables> {
	query: string;
	variables?: TVariables;
}

interface Error {
	message: string;
}

export const server = {
	fetch: async <TData = any, TVariables = any>(body: Body<TVariables>) => {
		const res = await fetch(process.env.REACT_APP_API!, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json; charset=utf-8',
			},
			credentials: 'include',
			body: JSON.stringify(body),
		});

		if (!res.ok) throw new Error('Failed to fetch from server');

		return res.json() as Promise<{ data: TData; errors: Error[] }>;
	},
};