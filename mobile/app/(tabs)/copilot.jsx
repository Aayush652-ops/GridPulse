import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Layout } from '../../constants/Layout';
import { chatService } from '../../services/chat';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

export default function CopilotScreen() {
  const [messages, setMessages] = useState([
    { id: '1', role: 'assistant', content: 'Hello Commander. I am GridPulse AI. How can I assist you with city operations today?' }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const flatListRef = useRef(null);

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage = { id: Date.now().toString(), role: 'user', content: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const response = await chatService.sendMessage(userMessage.content);
      const aiMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: response.response || 'I was unable to process that request.' 
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: 'Connection error. Please check your network and try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSpeech = (text) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      Speech.speak(text, {
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  };

  useEffect(() => {
    return () => Speech.stop();
  }, []);

  const renderMessage = ({ item }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageWrapper, isUser ? styles.messageWrapperUser : styles.messageWrapperAI]}>
        {!isUser && (
          <View style={styles.avatar}>
            <Ionicons name="hardware-chip" size={16} color={Colors.primary} />
          </View>
        )}
        <View style={[styles.messageBubble, isUser ? styles.messageBubbleUser : styles.messageBubbleAI]}>
          <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAI]}>
            {item.content}
          </Text>
          {!isUser && (
            <TouchableOpacity style={styles.speechBtn} onPress={() => toggleSpeech(item.content)}>
              <Ionicons name="volume-high" size={14} color={Colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen options={{ title: 'AI Copilot', headerStyle: { backgroundColor: Colors.surface }, headerTintColor: Colors.textPrimary }} />
      
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.listContent}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputArea}>
        <TextInput
          style={styles.input}
          placeholder="Ask GridPulse AI..."
          placeholderTextColor={Colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
          onPress={handleSend}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    padding: Layout.padding.screen,
    paddingBottom: 20,
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    maxWidth: '85%',
  },
  messageWrapperUser: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  messageWrapperAI: {
    alignSelf: 'flex-start',
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    alignSelf: 'flex-end',
    marginBottom: 4,
  },
  messageBubble: {
    padding: 14,
    borderRadius: Layout.radius.lg,
  },
  messageBubbleUser: {
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
  },
  messageBubbleAI: {
    backgroundColor: Colors.surfaceElevated,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  messageText: {
    ...Typography.body,
  },
  messageTextUser: {
    color: '#fff',
  },
  messageTextAI: {
    color: Colors.textPrimary,
  },
  speechBtn: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
  inputArea: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderRadius: Layout.radius.lg,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 48,
    maxHeight: 120,
    color: Colors.textPrimary,
    ...Typography.body,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 0,
  },
  sendButtonDisabled: {
    backgroundColor: Colors.borderLight,
  }
});
