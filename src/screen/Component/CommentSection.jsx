import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';
import firestore from '@react-native-firebase/firestore';

export default function CommentSection({ route }) {
  const { hotelId } = route.params;
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('comments')
      .where('hotelId', '==', hotelId)
      .orderBy('createdAt', 'desc')
      .onSnapshot((querySnapshot) => {
        const commentsList = [];
        querySnapshot.forEach((doc) => {
          const { userId, content, createdAt } = doc.data();
          commentsList.push({
            id: doc.id,
            userId,
            content,
            createdAt: createdAt.toDate(), // Convert Firestore Timestamp to Date
          });
        });
        setComments(commentsList);
        setLoading(false);
      });

    return () => unsubscribe();
  }, [hotelId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading comments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.commentContainer}>
            <Text style={styles.userName}>User: {item.userId}</Text>
            <Text style={styles.commentContent}>{item.content}</Text>
            <Text style={styles.commentDate}>
              {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString()}
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 10,
    paddingBottom: 10,
  },
  userName: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 16,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
});
