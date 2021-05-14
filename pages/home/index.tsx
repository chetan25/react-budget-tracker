import React, { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ILoggedUser } from 'Components/interface';
import { Spin } from 'antd';
import { useRouter } from 'next/router';
import { useAuth } from 'Services/useAuth';

const HomeComponent = dynamic(
    () => import('Components/home-component'),
    { ssr: false },
);
import 'Assets/default-theme.less';

const Home = (): JSX.Element => {
    const { loggedUser, loading } = useAuth();
    const router = useRouter();
   
    useEffect(() => {
        history.pushState(null, 'test', location.href);
        window.onpopstate = function () {
            history.go(1);
        };
    });

    
  useEffect(() => {
    // If auth is null and we are no longer loading
    if (!loggedUser && !loading) {
    //   redirect to index
      router.push('/');
    }
  }, [loggedUser, loading]);

    const renderHome = () => {
        const { displayName } = loggedUser || {displayName: null};
        if (!displayName) {
            return (
                <div className='spinner-wrapper'>
                    <Spin size="large" />
                </div>
            );
        }
        return (
            <div>
                <HomeComponent loggedUser={loggedUser as ILoggedUser}/>
            </div>
        );
    };

    return (
        <div>{renderHome()}</div>
    );
}

export default Home;