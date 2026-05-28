/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DNSRecord {
  type: string;
  value: string;
  name?: string;
  ttl?: number;
  priority?: number;
}

export interface NetworkInsight {
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
}

export interface LookupResult {
  domain: string;
  records: Record<string, DNSRecord[]>;
  insights: NetworkInsight[];
  summary: string;
  latency: number;
}

export type RecordType = 'A' | 'MX' | 'TXT' | 'CNAME' | 'NS' | 'SOA' | 'AAAA';
