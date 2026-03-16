import { useState, useEffect, useCallback } from 'react'
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useComments(spotId) {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    if (!spotId) return
    setLoading(true)
    try {
      let snapshot
      try {
        const q = query(
          collection(db, 'spots', spotId, 'comments'),
          orderBy('createdAt', 'desc')
        )
        snapshot = await getDocs(q)
      } catch {
        // Fallback without orderBy if index/rules not ready
        snapshot = await getDocs(collection(db, 'spots', spotId, 'comments'))
      }
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      // Sort client-side as fallback
      docs.sort((a, b) => {
        const ta = a.createdAt?.toDate?.() || new Date(a.createdAt) || 0
        const tb = b.createdAt?.toDate?.() || new Date(b.createdAt) || 0
        return tb - ta
      })
      setComments(docs)
    } catch (err) {
      console.error('Error fetching comments:', err)
    } finally {
      setLoading(false)
    }
  }, [spotId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const addComment = async (text, user, photoUrl = null) => {
    if (!spotId || !text.trim()) return
    try {
      const commentData = {
        text: text.trim(),
        authorUid: user.uid,
        authorName: user.displayName || '',
        authorEmail: user.email,
        authorPhoto: user.photoURL || '',
        createdAt: serverTimestamp()
      }
      if (photoUrl) commentData.photo = photoUrl

      const docRef = await addDoc(collection(db, 'spots', spotId, 'comments'), commentData)
      setComments(prev => [{
        id: docRef.id,
        ...commentData,
        createdAt: new Date()
      }, ...prev])
      return docRef.id
    } catch (err) {
      console.error('Error adding comment:', err)
      throw err
    }
  }

  const deleteComment = async (commentId) => {
    if (!spotId) return
    try {
      await deleteDoc(doc(db, 'spots', spotId, 'comments', commentId))
      setComments(prev => prev.filter(c => c.id !== commentId))
    } catch (err) {
      console.error('Error deleting comment:', err)
      throw err
    }
  }

  return { comments, loading, addComment, deleteComment, refresh: fetchComments }
}
