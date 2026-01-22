// ✅ Chat Screen - Built from Figma
import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { chat, fetchChatHistory } from '../../config/api';
import { useAuth } from '../../hooks/useAuth';
import figmaTokens from '../../design-system/figmaTokens';
import { HeaderBar } from '../../design-system/HeaderBar';

export default function ChatScreen({ navigation }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.email) {
      loadChatHistory();
    }
  }, [user?.email]);

  const loadChatHistory = async () => {
    try {
      const history = await fetchChatHistory(user.email);
      if (history && history.length > 0) {
        const formatted = [];
        history.forEach((item) => {
          const timestamp = new Date(item.createdAt || item.timestamp);
          formatted.push({
            id: `user_${item._id}`,
            text: item.message,
            sender: 'user',
            time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: timestamp.getTime(),
          });
          formatted.push({
            id: `ai_${item._id}`,
            text: item.reply,
            sender: 'ai',
            time: timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            timestamp: timestamp.getTime() + 1,
          });
        });
        formatted.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(formatted);
      } else {
        setMessages([{
          id: 'ai_welcome',
          text: "👋 Hello! I'm your AI Doctor. How can I help you today?",
          sender: 'ai',
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now(),
        }]);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      setMessages([{
        id: 'ai_welcome',
        text: "👋 Hello! I'm your AI Doctor. How can I help you today?",
        sender: 'ai',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      }]);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !user?.email) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      text: input,
      sender: 'user',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
    };

    setMessages((prev) => [userMessage, ...prev]);
    const messageText = input;
    setInput('');
    setLoading(true);

    try {
      const response = await chat(user.email, messageText);
      const aiReply = response.reply || 'I apologize, I could not generate a response.';

      const aiMessage = {
        id: `ai_${Date.now()}`,
        text: aiReply,
        sender: 'ai',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now() + 1,
      };

      setMessages((prev) => [aiMessage, ...prev]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: `error_${Date.now()}`,
        text: "⚠️ Sorry, I couldn't respond right now. Please try again.",
        sender: 'ai',
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        timestamp: Date.now(),
      };
      setMessages((prev) => [errorMessage, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.bubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble,
      ]}
    >
      <Text
        style={[
          styles.bubbleText,
          item.sender === 'user' ? styles.userText : styles.aiText,
        ]}
      >
        {item.text}
      </Text>
      <Text style={[styles.time, item.sender === 'user' ? styles.userTime : styles.aiTime]}>
        {item.time}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        <HeaderBar
          title="AI Chat"
          onBack={() => navigation.goBack()}
          backgroundColor={figmaTokens.colors.white}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            inverted
            contentContainerStyle={styles.chatContainer}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                placeholder="Ask me anything..."
                placeholderTextColor={figmaTokens.colors.mutedForeground}
                value={input}
                onChangeText={setInput}
                style={styles.input}
                multiline
                maxLength={500}
                returnKeyType="send"
                onSubmitEditing={handleSend}
                blurOnSubmit={false}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendButton, (!input.trim() || loading) && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={loading || !input.trim()}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator size="small" color={figmaTokens.colors.white} />
              ) : (
                <Icon name="send" size={20} color={figmaTokens.colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray50,
  },
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  chatContainer: {
    padding: figmaTokens.spacing['4'],
    paddingBottom: figmaTokens.spacing['2'],
  },
  bubble: {
    maxWidth: '80%',
    padding: figmaTokens.spacing['3'],
    borderRadius: figmaTokens.borderRadius.xl,
    marginBottom: figmaTokens.spacing['2'],
  },
  userBubble: {
    backgroundColor: figmaTokens.colors.blue500,
    alignSelf: 'flex-end',
    borderBottomRightRadius: figmaTokens.borderRadius['1'],
  },
  aiBubble: {
    backgroundColor: figmaTokens.colors.white,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: figmaTokens.borderRadius['1'],
    ...figmaTokens.shadows.sm,
  },
  bubbleText: {
    fontSize: figmaTokens.typography.fontSize.base,
    lineHeight: figmaTokens.typography.lineHeight.normal * figmaTokens.typography.fontSize.base,
  },
  userText: {
    color: figmaTokens.colors.white,
  },
  aiText: {
    color: figmaTokens.colors.gray900,
  },
  time: {
    fontSize: figmaTokens.typography.fontSize.xs,
    marginTop: figmaTokens.spacing['1'],
  },
  userTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  aiTime: {
    color: figmaTokens.colors.gray500,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: figmaTokens.spacing['4'],
    backgroundColor: figmaTokens.colors.white,
    borderTopWidth: 1,
    borderTopColor: figmaTokens.colors.gray200,
    gap: figmaTokens.spacing['2'],
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: figmaTokens.colors.gray100,
    borderRadius: figmaTokens.borderRadius.xl,
    paddingHorizontal: figmaTokens.spacing['4'],
    paddingVertical: figmaTokens.spacing['2'],
    maxHeight: 100,
  },
  input: {
    fontSize: figmaTokens.typography.fontSize.base,
    color: figmaTokens.colors.gray900,
    paddingVertical: figmaTokens.spacing['2'],
  },
  sendButton: {
    backgroundColor: figmaTokens.colors.blue500,
    borderRadius: figmaTokens.borderRadius.full,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
