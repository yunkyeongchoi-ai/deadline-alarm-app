import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

export default function Board() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [posts, setPosts] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        formattedDate: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate().toLocaleString('ko-KR')
          : '방금 전'
      }));
      setPosts(postList);
    }, (error) => {
      console.error("Firestore 불러오기 오류:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      return alert('제목과 내용을 모두 입력해 주세요.');
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content.trim(),
        createdAt: serverTimestamp(),
      });

      setTitle('');
      setContent('');
      alert('게시글이 성공적으로 등록되었습니다!');
    } catch (error) {
      console.error('글 등록 실패:', error);
      alert('글 등록 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>게시판 - Firestore 연동</title>
      </Head>

      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
        <nav style={{ marginBottom: '20px' }}>
          <Link href="/" style={{ color: '#7c3aed', fontWeight: 'bold', textDecoration: 'none' }}>
            ← 메인 알람 앱으로 돌아가기
          </Link>
        </nav>

        <h1 style={{ marginBottom: '20px', color: '#581c87' }}>📋 자유 게시판</h1>

        <form onSubmit={handleSubmit} style={{ background: '#ffffff', padding: '20px', borderRadius: '8px', border: '2px solid #8a2be2', marginBottom: '30px' }}>
          <div style={{ marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d8b4fe', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '12px' }}>
            <textarea
              placeholder="내용을 입력하세요"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d8b4fe', boxSizing: 'border-box' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #7c3aed, #db2777)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            {submitting ? '등록 중...' : '등록하기'}
          </button>
        </form>

        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '15px', color: '#371b58' }}>게시글 목록 ({posts.length})</h2>
          {posts.length === 0 ? (
            <p style={{ color: '#888', textAlign: 'center', padding: '40px 0' }}>등록된 게시글이 없습니다.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {posts.map((post) => (
                <div key={post.id} style={{ borderLeft: '4px solid #9333ea', padding: '15px', borderRadius: '6px', background: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#1e1b4b' }}>{post.title}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>{post.formattedDate}</span>
                  </div>
                  <p style={{ margin: 0, color: '#444', whiteSpace: 'pre-line' }}>{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
