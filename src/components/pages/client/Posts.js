import React, { useEffect, useState } from 'react';

const Posts = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Gọi API để lấy dữ liệu
        fetch('https://jsonplaceholder.typicode.com/posts')
            .then(response => response.json())
            .then(data => {
                setPosts(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Lỗi khi lấy dữ liệu:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <p>Đang tải bài viết...</p>;
    }

    return (
        <div>
            <h1>Danh sách bài viết</h1>
            <ul>
                {posts.map(post => (
                    <li key={post.id}>
                        <h2>{post.title}</h2>
                        <p>{post.body}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Posts;
