import React from 'react';
import { View, ScrollView, useWindowDimensions } from 'react-native';
import RenderHtml from 'react-native-render-html';

interface PostReaderProps {
  htmlContent: string;
}

export default function PostReader({ htmlContent }: PostReaderProps) {
  const { width } = useWindowDimensions();

  const tagsStyles = {
    body: {
      color: '#e4e4e7', // zinc-200
      fontSize: 17,
      lineHeight: 28,
      fontFamily: 'serif',
    },
    p: {
      marginBottom: 16,
    },
    h1: { color: '#f4f4f5', fontSize: 32, fontWeight: 'bold' as const, marginBottom: 16 },
    h2: { color: '#f4f4f5', fontSize: 24, fontWeight: 'bold' as const, marginTop: 24, marginBottom: 12 },
    h3: { color: '#f4f4f5', fontSize: 20, fontWeight: 'bold' as const, marginTop: 20, marginBottom: 10 },
    a: {
      color: '#f59e0b', // amber-500
      textDecorationLine: 'none' as const,
    },
    blockquote: {
      borderLeftWidth: 4,
      borderLeftColor: '#f59e0b',
      paddingLeft: 16,
      marginLeft: 0,
      fontStyle: 'italic' as const,
      color: '#a1a1aa',
    },
    img: {
      borderRadius: 8,
      marginVertical: 16,
    },
  };

  return (
    <ScrollView className="flex-1 bg-background px-4">
      <RenderHtml
        contentWidth={width - 32}
        source={{ html: htmlContent }}
        tagsStyles={tagsStyles}
        baseStyle={{ color: '#e4e4e7' }}
      />
    </ScrollView>
  );
}
