const axios = require('axios');

// Real API credentials (from .env or user provided)
const apiKey = 'ijNbs.YNiVuvGOKr7s80fio9Pklmq7X5Ndh3rAi7';
const apiSecret = 'IShKp40bnYmPHaLFhuKFZKse4wA0s6nK';

async function test() {
    try {
        console.log('Testing Token Endpoint...');
        const tokenUrl = 'https://atlas.propertyfinder.com/v1/auth/token';

        const tokenResponse = await axios.post(tokenUrl, {
            apiKey: apiKey,
            apiSecret: apiSecret
        }).catch(err => {
            console.log('Token Endpoint Failed:', err.response?.status, err.response?.data);
            return null;
        });

        if (tokenResponse) {
            console.log('Token Success:', tokenResponse.data);
            const token = tokenResponse.data.accessToken;

            console.log('Testing Agents Endpoint...');
            const agentsUrl = 'https://atlas.propertyfinder.com/v1/users';
            const agentsResponse = await axios.get(agentsUrl, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => {
                console.log('Agents Endpoint Failed:', err.response?.status, err.response?.data);
                return null;
            });

            if (agentsResponse) {
                // console.log('Agents Success:', JSON.stringify(agentsResponse.data, null, 2));
            }

            // Test Create Agent
            console.log('Testing Create Agent...');
            const createUrl = 'https://atlas.propertyfinder.com/v1/users';
            const randomEmail = `test.agent.${Math.floor(Math.random() * 10000)}@example.com`;

            // Construct payload based on previous errors and Agents.md hints
            const newAgentData = {
                firstName: "Test",
                lastName: "Agent",
                email: randomEmail,
                mobile: "+971500000000",
                roleId: 3, // Agent role
                publicProfile: {
                    name: "Test Agent Full Name",
                    bio: {
                        primary: "Test agent bio"
                    },
                    position: { primary: "Agent" }, // Keep object for now, if fails will try string
                    email: randomEmail,
                    phone: "+971500000000"
                    // Removed languages for now
                }
            };

            const createResponse = await axios.post(createUrl, newAgentData, {
                headers: { Authorization: `Bearer ${token}` }
            }).catch(err => {
                console.log('Create Agent Failed:', err.response?.status, JSON.stringify(err.response?.data));
                return null;
            });

            if (createResponse) {
                console.log('Create Agent Success:', createResponse.data);
                const newAgentId = createResponse.data.id;

                // Test Deactivate Agent (Method 1: PATCH status)
                console.log(`Testing Deactivate Agent (PATCH status) for ID ${newAgentId}...`);
                const updateUrl = `https://atlas.propertyfinder.com/v1/users/${newAgentId}`;
                await axios.patch(updateUrl, { status: 'inactive' }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    console.log('Deactivate (PATCH status=inactive) Success!');
                }).catch(err => {
                    console.log('Deactivate (PATCH status=inactive) Failed:', err.response?.status, JSON.stringify(err.response?.data));
                });

                // Test Deactivate Agent (Method 1b: PATCH status=archived)
                console.log(`Testing Deactivate Agent (PATCH status=archived) for ID ${newAgentId}...`);
                await axios.patch(updateUrl, { status: 'archived' }, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    console.log('Deactivate (PATCH status=archived) Success!');
                }).catch(err => {
                    console.log('Deactivate (PATCH status=archived) Failed:', err.response?.status, JSON.stringify(err.response?.data));
                });

                // Test Deactivate Agent (Method 2: DELETE)
                console.log(`Testing Deactivate Agent (DELETE) for ID ${newAgentId}...`);
                const deleteUrl = `https://atlas.propertyfinder.com/v1/users/${newAgentId}`;
                await axios.delete(deleteUrl, {
                    headers: { Authorization: `Bearer ${token}` }
                }).then(() => {
                    console.log('Deactivate (DELETE) Success!');
                }).catch(err => {
                    console.log('Deactivate (DELETE) Failed:', err.response?.status, JSON.stringify(err.response?.data));
                });
            }
        }

    } catch (error) {
        console.error('Unexpected Error:', error.message);
    }
}

test();
