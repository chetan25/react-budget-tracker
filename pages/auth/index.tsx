function Home() {
    // const [posts, setPosts] = useState<Array<{id: string; title: string; content: string}> | null>(null);
    // useEffect(() => {
    //     async function fetchData() {
    //         // const docRef = await firestore.collection('posts').add({
    //         //     title: 'add test',
    //         //     content: 'Works fine'
    //         // });
    //         // console.log(docRef);
    //         //delete
    //         // await firestore.doc(`posts/${id}`).delete();
    //         // const snapshot = await firestore.collection('posts').get();
    //         // const dbPosts = snapshot.docs.map((doc) : {id: string; title: string; content: string} => {
    //         //     const data = doc.data();
    //         //     return { id: doc.id, title: data.title, content: data.content };
    //         // });
    //         // console.log(dbPosts);
    //         // setPosts(dbPosts);
    //
    //         //to subscribe to the data store
    //         unsubscribe = firestore.collection('posts').onSnapshot(snapshot => {
    //             const newPosts = snapshot.docs.map((doc): {id: string; title: string; content: string} => {
    //                 const data = doc.data();
    //                 return { id: doc.id, title: data.title, content: data.content };
    //             });
    //             setPosts(newPosts);
    //         });
    //         unsubscribeAuth = auth.onAuthStateChanged(async userAuth => {
    //             //create user if not there
    //             const user = await createUserProfileDocument(userAuth);
    //             console.log(user);
    //         });
    //         console.log(unsubscribe, unsubscribeAuth);
    //     }
    //     fetchData();
    // }, []);
    return (
        <div>
        </div>
    );
}

export default Home;