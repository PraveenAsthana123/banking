#!/usr/bin/env python3
"""
Preprocessing Pipeline Scheduler
=================================
Runs the preprocessing pipeline on a schedule using APScheduler
or can be invoked via cron.

Usage:
    # One-shot run (for cron)
    python3 preprocessing_scheduler.py --once

    # Daemon mode with built-in scheduler
    python3 preprocessing_scheduler.py --daemon --interval-hours 24

    # Cron setup helper
    python3 preprocessing_scheduler.py --setup-cron
"""

import os
import sys
import argparse
import subprocess
import logging
from datetime import datetime

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PIPELINE_SCRIPT = os.path.join(SCRIPT_DIR, "preprocessing_pipeline.py")
LOG_DIR = os.path.join(SCRIPT_DIR, "logs")
LOCK_FILE = os.path.join(LOG_DIR, "pipeline.lock")

os.makedirs(LOG_DIR, exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.FileHandler(os.path.join(LOG_DIR, "scheduler.log")),
        logging.StreamHandler(),
    ],
)
log = logging.getLogger("scheduler")


def acquire_lock():
    """Simple file-based lock to prevent concurrent runs."""
    if os.path.exists(LOCK_FILE):
        with open(LOCK_FILE) as f:
            pid = f.read().strip()
        # Check if process is still running
        try:
            os.kill(int(pid), 0)
            return False  # Process still running
        except (OSError, ValueError):
            pass  # Stale lock
    with open(LOCK_FILE, "w") as f:
        f.write(str(os.getpid()))
    return True


def release_lock():
    if os.path.exists(LOCK_FILE):
        os.remove(LOCK_FILE)


def run_pipeline():
    """Execute the preprocessing pipeline."""
    log.info("Starting preprocessing pipeline run...")
    start = datetime.now()
    try:
        result = subprocess.run(
            [sys.executable, PIPELINE_SCRIPT],
            capture_output=True, text=True, timeout=7200,  # 2 hour timeout
        )
        elapsed = (datetime.now() - start).total_seconds()
        if result.returncode == 0:
            log.info(f"Pipeline completed in {elapsed:.1f}s")
            log.info(result.stdout[-500:] if len(result.stdout) > 500 else result.stdout)
        else:
            log.error(f"Pipeline failed (exit {result.returncode}) in {elapsed:.1f}s")
            log.error(result.stderr[-1000:] if len(result.stderr) > 1000 else result.stderr)
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        log.error("Pipeline timed out after 2 hours")
        return False
    except Exception as e:
        log.error(f"Pipeline error: {e}")
        return False


def run_once():
    """Single run with locking."""
    if not acquire_lock():
        log.warning("Another pipeline run is already in progress. Skipping.")
        return
    try:
        run_pipeline()
    finally:
        release_lock()


def run_daemon(interval_hours):
    """Run as a daemon with built-in scheduling."""
    try:
        from apscheduler.schedulers.blocking import BlockingScheduler
    except ImportError:
        log.error("APScheduler not installed. Install with: pip install apscheduler")
        log.info("Falling back to simple loop...")
        import time
        while True:
            run_once()
            log.info(f"Next run in {interval_hours} hours...")
            time.sleep(interval_hours * 3600)
        return

    scheduler = BlockingScheduler()
    scheduler.add_job(run_once, "interval", hours=interval_hours,
                      id="preprocessing_pipeline", replace_existing=True,
                      next_run_time=datetime.now())
    log.info(f"Scheduler started. Running every {interval_hours} hours.")
    try:
        scheduler.start()
    except KeyboardInterrupt:
        log.info("Scheduler stopped.")


def setup_cron():
    """Print cron setup instructions."""
    cron_line = f"0 2 * * * cd {SCRIPT_DIR} && {sys.executable} {os.path.abspath(__file__)} --once >> {LOG_DIR}/cron.log 2>&1"
    print("Add this line to your crontab (runs daily at 2 AM):")
    print()
    print(f"  {cron_line}")
    print()
    print("To edit crontab: crontab -e")
    print(f"Logs: {LOG_DIR}/scheduler.log")


def main():
    parser = argparse.ArgumentParser(description="Preprocessing Pipeline Scheduler")
    parser.add_argument("--once", action="store_true", help="Run pipeline once and exit")
    parser.add_argument("--daemon", action="store_true", help="Run as daemon with scheduler")
    parser.add_argument("--interval-hours", type=float, default=24, help="Hours between runs (daemon mode)")
    parser.add_argument("--setup-cron", action="store_true", help="Print cron setup instructions")
    args = parser.parse_args()

    if args.setup_cron:
        setup_cron()
    elif args.daemon:
        run_daemon(args.interval_hours)
    elif args.once:
        run_once()
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
