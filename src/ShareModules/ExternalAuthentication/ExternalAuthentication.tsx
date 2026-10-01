import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from "@/constants/constants";
import { FRONTEND_BASE } from "@/constants/constants";

function ExternalAuthentication() {
    const [searchParams] = useSearchParams();

    useEffect(() => {
        const expiry = searchParams.get('expiry');
        const uid = searchParams.get('uid');
        const page = searchParams.get('page');

        if (!expiry || !uid || !page) return;

        const callApi = async () => {
            try {
                const res = await axios.post(
                    `${API_BASE}labourdept/eservices/external-auth-validate`,
                    {
                        expiry,
                        uid,
                    }
                );

                if (res.data?.result?.token) {
                    // ✅ Store in localStorage
                    localStorage.setItem(
                        'lc_portal_auth',
                        JSON.stringify({
                            token: res.data.result.token,
                            user: res.data.result.user,
                        })
                    );

                    // ✅ Redirect
                    window.location.href = `${FRONTEND_BASE}/${page}`;
                }
            } catch (err) {
                console.error('Auth failed', err);
            }
        };

        callApi();
    }, [searchParams]);

    // ✅ Loading screen
    return (
        <div style={{ padding: '20px' }}>
            <h3>Authenticating...</h3>
        </div>
    );
}

export default ExternalAuthentication;