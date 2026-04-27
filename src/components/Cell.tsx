import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

type Props = {
  size: number;
  color: string | null;
  label?: string;
  isEndpoint?: boolean;
};

export function Cell({size, color, label, isEndpoint}: Props) {
  return (
    <View style={[styles.cell, {width: size, height: size}]}>
      {color && <View style={[styles.pathFill, {backgroundColor: color}]} />}

      {isEndpoint && (
        <View style={[styles.endpoint, {backgroundColor: color || '#999'}]}>
          <Text style={styles.endpointText}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    borderColor: '#d7dce5',
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pathFill: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 14,
    opacity: 0.75,
  },
  endpoint: {
    width: '78%',
    height: '78%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  endpointText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 18,
  },
});