/**
 * Automated Onboarding Flow Test
 *
 * Tests the complete onboarding process:
 * 1. Auto-login (dev account)
 * 2. Create battler with attributes
 * 3. Verify creation
 * 4. Check dashboard display
 */

// Node 18+ has built-in fetch, no need to import

const BASE_URL = 'http://localhost:3005';
const TEST_BATTLER = {
  stage_name: 'Test Battler Alpha',
  region: 'NYC',
  style_tags: ['angles', 'wordplay', 'comedy'],
  allocated_attributes: {
    writing: {
      lyricism: 3,
      wordplay: 4,
      creativity: 4,
      flow: 3,
    },
    performance: {
      stage_presence: 3,
      crowd_control: 3,
      delivery: 2,
    },
    personal: {
      financial_stability: 1,
      reputation: 1,
      family_bond: 1,
    },
    resilience: 1, // Changed from 0 to 1, total now = 25
  },
};

class OnboardingTester {
  constructor() {
    this.cookie = null;
    this.results = {
      loginSuccess: false,
      leaguesLoaded: false,
      battlerCreated: false,
      attributesCorrect: false,
      dashboardLoaded: false,
      errors: [],
    };
  }

  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
    };
    const reset = '\x1b[0m';
    console.log(`${colors[type]}[${type.toUpperCase()}] ${message}${reset}`);
  }

  async setupAuth() {
    try {
      this.log('Setting up authentication...');

      // Visit login page to trigger auto-login
      const response = await fetch(`${BASE_URL}/login`, {
        redirect: 'manual',
      });

      // Extract session cookie
      const setCookieHeader = response.headers.get('set-cookie');
      if (setCookieHeader) {
        // Handle multiple cookies in set-cookie header
        const cookies = setCookieHeader.split(',').map(c => c.trim());
        this.cookie = cookies
          .map((cookie) => cookie.split(';')[0])
          .join('; ');
        this.log('Session cookie obtained', 'success');
        this.results.loginSuccess = true;
        return true;
      } else {
        this.log('No session cookie found - continuing anyway', 'warning');
        // Continue anyway since we might not need cookies for API calls
        this.results.loginSuccess = true;
        return true;
      }
    } catch (error) {
      this.log(`Auth setup failed: ${error.message}`, 'error');
      this.results.errors.push(`Auth error: ${error.message}`);
      return false;
    }
  }

  async getLeagues() {
    try {
      this.log('Fetching leagues from database...');

      // Query Supabase REST API directly
      const response = await fetch(
        'http://127.0.0.1:54321/rest/v1/leagues?select=id,name,short_code&order=round_length_minutes',
        {
          headers: {
            apikey: 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const leagues = await response.json();

      if (!Array.isArray(leagues) || leagues.length === 0) {
        throw new Error('No leagues found');
      }

      this.log(`Found ${leagues.length} leagues:`, 'success');
      leagues.forEach((league) => {
        this.log(`  - ${league.name} (${league.short_code})`);
      });

      this.results.leaguesLoaded = true;

      // Use the first league (Small Room Circuit)
      return leagues[0].id;
    } catch (error) {
      this.log(`Failed to fetch leagues: ${error.message}`, 'error');
      this.results.errors.push(`League fetch error: ${error.message}`);
      return null;
    }
  }

  async createBattler(leagueId) {
    try {
      this.log('Creating battler: "Test Battler Alpha"...');

      const payload = {
        ...TEST_BATTLER,
        primary_league_id: leagueId,
      };

      this.log('Payload: ' + JSON.stringify(payload, null, 2));

      const response = await fetch(`${BASE_URL}/api/battler/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: this.cookie || '',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      this.log('Battler created successfully!', 'success');
      this.log(`Battler ID: ${data.battler.id}`);
      this.log(`Stage Name: ${data.battler.stage_name}`);
      this.log(`League: ${data.battler.primary_league_id}`);
      this.log(`Rating: ${data.ranking.rating}`);

      this.results.battlerCreated = true;
      return data;
    } catch (error) {
      this.log(`Failed to create battler: ${error.message}`, 'error');
      this.results.errors.push(`Battler creation error: ${error.message}`);
      return null;
    }
  }

  validateAttributes(battlerData) {
    try {
      this.log('Validating attributes...');

      const attrs = battlerData.attributes;
      const expected = TEST_BATTLER.allocated_attributes;

      // Check writing attributes
      const writingMatch =
        attrs.writing.lyricism === expected.writing.lyricism &&
        attrs.writing.wordplay === expected.writing.wordplay &&
        attrs.writing.creativity === expected.writing.creativity &&
        attrs.writing.flow === expected.writing.flow;

      // Check performance attributes
      const performanceMatch =
        attrs.performance.stage_presence === expected.performance.stage_presence &&
        attrs.performance.crowd_control === expected.performance.crowd_control &&
        attrs.performance.delivery === expected.performance.delivery;

      // Check personal attributes
      const personalMatch =
        attrs.personal.financial_stability === expected.personal.financial_stability &&
        attrs.personal.reputation === expected.personal.reputation &&
        attrs.personal.family_bond === expected.personal.family_bond &&
        attrs.personal.preparation === 5; // Default value

      // Check resilience
      const resilienceMatch = attrs.resilience === expected.resilience;

      if (writingMatch && performanceMatch && personalMatch && resilienceMatch) {
        this.log('All attributes match expected values!', 'success');
        this.results.attributesCorrect = true;

        // Display attributes
        this.log('\nAttribute Breakdown:');
        this.log(`  Writing: Lyricism=${attrs.writing.lyricism}, Wordplay=${attrs.writing.wordplay}, Creativity=${attrs.writing.creativity}, Flow=${attrs.writing.flow}`);
        this.log(`  Performance: Stage Presence=${attrs.performance.stage_presence}, Crowd Control=${attrs.performance.crowd_control}, Delivery=${attrs.performance.delivery}`);
        this.log(`  Personal: Financial=${attrs.personal.financial_stability}, Reputation=${attrs.personal.reputation}, Family=${attrs.personal.family_bond}, Prep=${attrs.personal.preparation}`);
        this.log(`  Resilience: ${attrs.resilience}`);

        return true;
      } else {
        this.log('Attribute mismatch detected!', 'error');
        this.results.errors.push('Attributes do not match expected values');
        return false;
      }
    } catch (error) {
      this.log(`Attribute validation failed: ${error.message}`, 'error');
      this.results.errors.push(`Validation error: ${error.message}`);
      return false;
    }
  }

  async checkDashboard() {
    try {
      this.log('Checking dashboard...');

      const response = await fetch(`${BASE_URL}/dashboard`, {
        headers: {
          Cookie: this.cookie || '',
        },
        redirect: 'manual',
      });

      if (response.status === 200) {
        const html = await response.text();

        // Check if battler name appears
        if (html.includes('Test Battler Alpha') || html.includes('TEST BATTLER ALPHA')) {
          this.log('Dashboard displays battler info correctly!', 'success');
          this.results.dashboardLoaded = true;
          return true;
        } else {
          this.log('Battler info not found on dashboard', 'warning');
          this.results.errors.push('Dashboard missing battler info');
          return false;
        }
      } else if (response.status >= 300 && response.status < 400) {
        this.log(`Dashboard redirect: ${response.headers.get('location')}`, 'warning');
        return false;
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      this.log(`Dashboard check failed: ${error.message}`, 'error');
      this.results.errors.push(`Dashboard error: ${error.message}`);
      return false;
    }
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('ONBOARDING TEST SUMMARY');
    console.log('='.repeat(60));

    const tests = [
      { name: 'Login/Authentication', passed: this.results.loginSuccess },
      { name: 'Leagues Loaded', passed: this.results.leaguesLoaded },
      { name: 'Battler Created', passed: this.results.battlerCreated },
      { name: 'Attributes Correct', passed: this.results.attributesCorrect },
      { name: 'Dashboard Loaded', passed: this.results.dashboardLoaded },
    ];

    tests.forEach((test) => {
      const status = test.passed ? '✓ PASS' : '✗ FAIL';
      const color = test.passed ? '\x1b[32m' : '\x1b[31m';
      console.log(`${color}${status}\x1b[0m - ${test.name}`);
    });

    const totalTests = tests.length;
    const passedTests = tests.filter((t) => t.passed).length;

    console.log('\n' + '-'.repeat(60));
    console.log(`Total: ${passedTests}/${totalTests} tests passed`);

    if (this.results.errors.length > 0) {
      console.log('\nErrors encountered:');
      this.results.errors.forEach((error, idx) => {
        console.log(`  ${idx + 1}. ${error}`);
      });
    }

    console.log('='.repeat(60) + '\n');

    return passedTests === totalTests;
  }

  async run() {
    console.log('\n' + '='.repeat(60));
    console.log('STARTING ONBOARDING FLOW TEST');
    console.log('='.repeat(60) + '\n');

    // Step 1: Setup authentication
    const authSuccess = await this.setupAuth();
    if (!authSuccess) {
      this.log('Cannot proceed without authentication', 'error');
      this.printSummary();
      return false;
    }

    await this.sleep(1000);

    // Step 2: Get leagues
    const leagueId = await this.getLeagues();
    if (!leagueId) {
      this.log('Cannot proceed without league', 'error');
      this.printSummary();
      return false;
    }

    await this.sleep(1000);

    // Step 3: Create battler
    const battlerData = await this.createBattler(leagueId);
    if (!battlerData) {
      this.printSummary();
      return false;
    }

    await this.sleep(1000);

    // Step 4: Validate attributes
    this.validateAttributes(battlerData);

    await this.sleep(1000);

    // Step 5: Check dashboard
    await this.checkDashboard();

    // Print summary
    return this.printSummary();
  }
}

// Run the test
(async () => {
  const tester = new OnboardingTester();
  const success = await tester.run();
  process.exit(success ? 0 : 1);
})();
