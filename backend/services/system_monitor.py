"""System monitoring using psutil."""

import logging
import platform
from datetime import datetime

from backend.core.utils import human_size as _human_size

logger = logging.getLogger(__name__)


def get_system_metrics() -> dict:
    """Get real CPU, memory, disk metrics."""
    try:
        import psutil

        cpu_pct = psutil.cpu_percent(interval=0.5)
        cpu_count = psutil.cpu_count()
        cpu_freq = psutil.cpu_freq()

        mem = psutil.virtual_memory()
        disk = psutil.disk_usage("/")
        swap = psutil.swap_memory()

        # Network IO
        net = psutil.net_io_counters()

        # Boot time
        boot = datetime.fromtimestamp(psutil.boot_time())
        uptime = datetime.now() - boot

        return {
            "cpu": {
                "percent": cpu_pct,
                "count": cpu_count,
                "freq_mhz": cpu_freq.current if cpu_freq else None,
            },
            "memory": {
                "total": mem.total,
                "available": mem.available,
                "used": mem.used,
                "percent": mem.percent,
                "total_human": _human_size(mem.total),
                "used_human": _human_size(mem.used),
            },
            "disk": {
                "total": disk.total,
                "used": disk.used,
                "free": disk.free,
                "percent": disk.percent,
                "total_human": _human_size(disk.total),
                "used_human": _human_size(disk.used),
            },
            "swap": {
                "total": swap.total,
                "used": swap.used,
                "percent": swap.percent,
            },
            "network": {
                "bytes_sent": net.bytes_sent,
                "bytes_recv": net.bytes_recv,
            },
            "system": {
                "platform": platform.system(),
                "release": platform.release(),
                "python_version": platform.python_version(),
                "uptime_hours": round(uptime.total_seconds() / 3600, 1),
            },
            "timestamp": datetime.now().isoformat(),
        }

    except ImportError:
        return {
            "error": "psutil not installed",
            "system": {
                "platform": platform.system(),
                "release": platform.release(),
                "python_version": platform.python_version(),
            },
            "timestamp": datetime.now().isoformat(),
        }
